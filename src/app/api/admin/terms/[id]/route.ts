import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

const Schema = z.object({
  chinese: z.string().min(1).optional(),
  thai: z.string().optional(),
  vietnamese: z.string().optional(),
  indonesian: z.string().optional(),
  malay: z.string().optional(),
  khmer: z.string().optional(),
  burmese: z.string().optional(),
  lao: z.string().optional(),
  category: z.enum(["TEST_ITEM", "TEST_METHOD", "STANDARD", "CONCLUSION", "EQUIPMENT", "GENERAL"]).optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = Schema.parse(await req.json());
    const existing = await prisma.term.findUnique({ where: { id } });
    if (!existing) return fail("术语不存在", 404, "NOT_FOUND");
    const updated = await prisma.term.update({ where: { id }, data: body });
    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await prisma.term.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
