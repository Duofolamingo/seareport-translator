// 发送验证码
// 开发期：直接返回验证码（控制台输出）
// 生产期：接入阿里云短信

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";

const Schema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号"),
});

export async function POST(req: Request) {
  try {
    const { phone } = Schema.parse(await req.json());
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.verificationCode.create({
      data: { phone, code, expiresAt },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Verification code for ${phone}: ${code}`);
    }

    // 生产环境：调用阿里云短信 API
    // 接入代码：await sendSms(phone, code);

    return ok({
      sent: true,
      // 开发环境直接返回验证码方便测试
      devCode: process.env.NODE_ENV === "development" ? code : undefined,
    });
  } catch (err) {
    return handleError(err);
  }
}
