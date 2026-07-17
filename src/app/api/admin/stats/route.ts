// 管理员数据看板

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalOrders, todayOrders, completedOrders, failedOrders, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "FAILED" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { phone: true, name: true } } },
      }),
    ]);

    // 按语言统计
    const byLanguage = await prisma.order.groupBy({
      by: ["targetLang"],
      _count: true,
    });

    return ok({
      totalUsers,
      totalOrders,
      todayOrders,
      completedOrders,
      failedOrders,
      successRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      byLanguage: byLanguage.map((x) => ({ lang: x.targetLang, count: x._count })),
      recentOrders,
    });
  } catch (err) {
    return handleError(err);
  }
}
