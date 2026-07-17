// 用户资料更新
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

const Schema = z.object({
  name: z.string().max(50).optional(),
  company: z.string().max(100).optional(),
});

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    const body = Schema.parse(await req.json());
    await prisma.user.update({
      where: { id: user.id },
      data: body,
    });
    return ok({ updated: true });
  } catch (err) {
    return handleError(err);
  }
}
