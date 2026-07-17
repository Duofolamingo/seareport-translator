// 失败任务重试

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { runTranslationPipeline } from "@/lib/services/translationPipeline";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return fail("订单不存在", 404, "NOT_FOUND");
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return fail("无权限", 403, "FORBIDDEN");
    }
    if (order.status !== "FAILED") {
      return fail("仅失败订单可重试", 400, "NOT_FAILED");
    }

    await prisma.order.update({
      where: { id },
      data: { status: "PENDING", errorMessage: null, progress: 0, progressMessage: "重试中..." },
    });

    runTranslationPipeline({
      orderId: order.id,
      fileUrl: order.fileUrl,
      fileName: order.fileName,
      fileType: order.fileType,
      targetLang: order.targetLang as any,
      outputFormat: order.outputFormat as any,
    }).catch((err) => console.error("[Retry Pipeline Error]", err));

    return ok({ retried: true });
  } catch (err) {
    return handleError(err);
  }
}
