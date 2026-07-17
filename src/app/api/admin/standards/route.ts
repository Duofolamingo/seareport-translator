// 管理员 - 标准映射 CRUD

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

const Schema = z.object({
  gbStandard: z.string().min(1),
  gbName: z.string().min(1),
  targetCountry: z.enum(["THAILAND", "VIETNAM", "INDONESIA", "MALAYSIA", "PHILIPPINES", "CAMBODIA", "MYANMAR", "LAOS"]),
  targetStandard: z.string().min(1),
  targetName: z.string().min(1),
  productCategory: z.enum(["ELECTRONICS", "TEXTILE", "TOY", "FOOD", "COSMETICS", "BUILDING", "FOOTWEAR", "OTHER"]),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = Schema.parse(await req.json());
    const created = await prisma.standardMapping.create({ data: body });
    return ok(created);
  } catch (err) {
    return handleError(err);
  }
}
