// SSE 实时进度推送

import { prisma } from "@/lib/prisma";
import { subscribeProgress } from "@/lib/services/sse";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return new Response("Not found", { status: 404 });
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return new Response("Forbidden", { status: 403 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // 立即发送当前状态
        send({
          status: order.status,
          progress: order.progress,
          message: order.progressMessage || "",
        });

        // 已完成则关闭
        if (order.status === "COMPLETED" || order.status === "FAILED") {
          send({ done: true });
          controller.close();
          return;
        }

        // 订阅实时推送
        const unsub = subscribeProgress(id, (event) => {
          send(event);
          if (event.status === "COMPLETED" || event.status === "FAILED") {
            send({ done: true });
            setTimeout(() => {
              try { controller.close(); } catch { /* */ }
            }, 200);
            unsub();
          }
        });

        // 30 秒无消息则心跳
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          } catch {
            clearInterval(heartbeat);
            unsub();
          }
        }, 15000);

        // 客户端断开
        req.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          unsub();
          try { controller.close(); } catch { /* */ }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
