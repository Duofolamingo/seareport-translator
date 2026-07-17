// 认证：手机号 + 密码登录（开发期）
// 验证码流程可在生产环境接入阿里云短信

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";

const LoginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号"),
  password: z.string().min(6, "密码至少 6 位").optional(),
  code: z.string().length(6).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password, code } = LoginSchema.parse(body);

    if (!password && !code) {
      return fail("请提供密码或验证码", 400, "MISSING_CRED");
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return fail("用户不存在", 404, "USER_NOT_FOUND");

    // 密码登录
    if (password) {
      if (!user.password) return fail("该账号未设置密码", 400, "NO_PASSWORD");
      if (!verifyPassword(password, user.password)) {
        return fail("密码错误", 401, "WRONG_PASSWORD");
      }
    }

    // 验证码登录
    if (code) {
      const record = await prisma.verificationCode.findFirst({
        where: { phone, code, used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      });
      if (!record) return fail("验证码无效或已过期", 401, "INVALID_CODE");
      await prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } });
    }

    const token = await createSession(user.id);

    return ok({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        company: user.company,
        role: user.role,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
