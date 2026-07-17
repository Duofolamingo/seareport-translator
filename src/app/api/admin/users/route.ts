// 管理员 API - 用户列表

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(url.searchParams.get("pageSize") || "20"), 100);

    const where: any = {};
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          phone: true,
          name: true,
          company: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return ok({ items, total, page, pageSize });
  } catch (err) {
    return handleError(err);
  }
}
