// 订单 API - 创建订单 + 列表查询

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { enqueue } from "@/lib/services/taskQueue";
import { runTranslationPipeline } from "@/lib/services/translationPipeline";

const CreateSchema = z.object({
  fileUrl: z.string().min(1),
  fileName: z.string().min(1),
  fileType: z.enum(["PDF", "IMAGE"]),
  pageCount: z.number().int().positive().optional(),
  targetLang: z.enum(["TH", "VI", "ID", "MS", "KM", "MY", "LO"]),
  outputFormat: z.enum(["PDF", "WORD", "PNG", "JPG", "COMPARISON"]).default("PDF"),
  reportType: z.enum(["ELECTRONICS", "TEXTILE", "TOY", "FOOD", "COSMETICS", "BUILDING", "FOOTWEAR", "OTHER"]).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = CreateSchema.parse(await req.json());

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        fileName: body.fileName,
        fileUrl: body.fileUrl,
        fileType: body.fileType,
        pageCount: body.pageCount,
        targetLang: body.targetLang,
        outputFormat: body.outputFormat,
        reportType: body.reportType,
        status: "PENDING",
        progress: 0,
        progressMessage: "任务已加入队列",
      },
    });

    // 异步执行翻译（不阻塞响应）
    const task = {
      orderId: order.id,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileType: body.fileType,
      targetLang: body.targetLang,
      outputFormat: body.outputFormat,
      enqueuedAt: Date.now(),
    };

    // 双轨：先 enqueue，再 fire-and-forget pipeline
    enqueue(task).catch(() => {});
    runTranslationPipeline({
      orderId: order.id,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileType: body.fileType,
      targetLang: body.targetLang,
      outputFormat: body.outputFormat,
    }).catch((err) => {
      console.error("[Pipeline Error]", err);
    });

    return ok({ orderId: order.id });
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(url.searchParams.get("pageSize") || "20"), 100);

    const where: any = { userId: user.id };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return ok({ items, total, page, pageSize });
  } catch (err) {
    return handleError(err);
  }
}
