import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

const Schema = z.object({
  gbStandard: z.string().min(1).optional(),
  gbName: z.string().min(1).optional(),
  targetStandard: z.string().min(1).optional(),
  targetName: z.string().min(1).optional(),
  notes: z.string().optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = Schema.parse(await req.json());
    const existing = await prisma.standardMapping.findUnique({ where: { id } });
    if (!existing) return fail("标准不存在", 404, "NOT_FOUND");
    const updated = await prisma.standardMapping.update({ where: { id }, data: body });
    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await prisma.standardMapping.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
