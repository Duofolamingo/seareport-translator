// 标准查询（公开）

import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const gbStandard = url.searchParams.get("gbStandard") || undefined;
    const targetCountry = url.searchParams.get("targetCountry") || undefined;
    const productCategory = url.searchParams.get("productCategory") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const where: Record<string, unknown> = {};
    if (gbStandard) where.gbStandard = { contains: gbStandard, mode: "insensitive" };
    if (targetCountry) where.targetCountry = targetCountry;
    if (productCategory) where.productCategory = productCategory;
    if (search) {
      where.OR = [
        { gbStandard: { contains: search, mode: "insensitive" } },
        { gbName: { contains: search, mode: "insensitive" } },
        { targetStandard: { contains: search, mode: "insensitive" } },
        { targetName: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.standardMapping.findMany({
      where,
      orderBy: [{ gbStandard: "asc" }, { targetCountry: "asc" }],
      take: 200,
    });
    return ok({ items });
  } catch (err) {
    return handleError(err);
  }
}
