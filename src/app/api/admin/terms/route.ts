// 管理员 - 术语 CRUD

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

const Schema = z.object({
  chinese: z.string().min(1),
  thai: z.string().optional(),
  vietnamese: z.string().optional(),
  indonesian: z.string().optional(),
  malay: z.string().optional(),
  khmer: z.string().optional(),
  burmese: z.string().optional(),
  lao: z.string().optional(),
  category: z.enum(["TEST_ITEM", "TEST_METHOD", "STANDARD", "CONCLUSION", "EQUIPMENT", "GENERAL"]),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = Schema.parse(await req.json());
    const created = await prisma.term.create({ data: body });
    return ok(created);
  } catch (err) {
    return handleError(err);
  }
}
