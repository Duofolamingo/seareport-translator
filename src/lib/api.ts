// API 统一响应工具

import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiError = { success: false; error: string; code?: string };
export type ApiSuccess<T> = { success: true; data: T };

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(error: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, error, ...(code ? { code } : {}) }, { status });
}

export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return fail(err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "), 400, "VALIDATION");
  }
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return fail("未登录", 401, "UNAUTHORIZED");
    if (err.message === "FORBIDDEN") return fail("无权限", 403, "FORBIDDEN");
    return fail(err.message, 500);
  }
  return fail("服务器内部错误", 500);
}
