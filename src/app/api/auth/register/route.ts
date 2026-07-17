// 用户注册（开发期）
// 生产期应改为邀请制或后台开通

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";
import { hashPassword, createSession } from "@/lib/auth";

const Schema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号"),
  password: z.string().min(6, "密码至少 6 位"),
  name: z.string().optional(),
  company: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = Schema.parse(await req.json());
    const existing = await prisma.user.findUnique({ where: { phone: body.phone } });
    if (existing) return fail("该手机号已注册", 409, "ALREADY_REGISTERED");

    const user = await prisma.user.create({
      data: {
        phone: body.phone,
        password: hashPassword(body.password),
        name: body.name,
        company: body.company,
      },
    });

    // 默认订阅 FREE
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "FREE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    await createSession(user.id);
    return ok({ userId: user.id });
  } catch (err) {
    return handleError(err);
  }
}
