// 订单详情 / 删除

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return fail("订单不存在", 404, "NOT_FOUND");
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return fail("无权限", 403, "FORBIDDEN");
    }
    return ok(order);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return fail("订单不存在", 404, "NOT_FOUND");
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return fail("无权限", 403, "FORBIDDEN");
    }
    await prisma.order.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
