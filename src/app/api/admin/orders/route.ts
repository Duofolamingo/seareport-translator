// 管理员 API - 全部订单

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(url.searchParams.get("pageSize") || "20"), 100);

    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { phone: true, name: true, company: true } } },
      }),
      prisma.order.count({ where }),
    ]);
    return ok({ items, total, page, pageSize });
  } catch (err) {
    return handleError(err);
  }
}
