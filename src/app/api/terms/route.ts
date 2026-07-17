// 术语库查询（公开）

import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const category = (url.searchParams.get("category") as any) || undefined;

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { chinese: { contains: search, mode: "insensitive" } },
        { thai: { contains: search, mode: "insensitive" } },
        { vietnamese: { contains: search, mode: "insensitive" } },
        { indonesian: { contains: search, mode: "insensitive" } },
        { malay: { contains: search, mode: "insensitive" } },
        { khmer: { contains: search, mode: "insensitive" } },
        { burmese: { contains: search, mode: "insensitive" } },
        { lao: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.term.findMany({ where, take: 200 });
    return ok({ items });
  } catch (err) {
    return handleError(err);
  }
}
