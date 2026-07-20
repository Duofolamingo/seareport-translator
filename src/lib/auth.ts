// 认证工具：基于 cookie 的轻量级 session
// 在 Next.js 15 App Router 中使用 Edge-compatible 的简单实现
// 用户态通过 Cookie 存储 token，token 在数据库 Session 表中校验

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/constants";
import { nanoid } from "nanoid";

const COOKIE_NAME = "seareport_session";
const SESSION_TTL_DAYS = 30;

export type SessionUser = {
  id: string;
  phone: string;
  name: string | null;
  company: string | null;
  role: Role;
};

/** 创建 session 并写入 cookie */
export async function createSession(userId: string): Promise<string> {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });

  return token;
}

/** 销毁 session */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }
  jar.delete(COOKIE_NAME);
}

/** 获取当前登录用户 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    phone: session.user.phone,
    name: session.user.name,
    company: session.user.company,
    role: session.user.role as Role,
  };
}

/** 密码哈希 */
export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

/** 要求登录用户（用于 Server Component / Route Handler） */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export { COOKIE_NAME };
