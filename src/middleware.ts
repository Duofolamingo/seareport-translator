// 路由守卫：保护 /admin/* 路径

import { NextResponse, type NextRequest } from "next/server";

// 注：本项目使用 cookie + DB session 模式，无需 JWT
// 此中间件仅作为路径前缀保护示例，实际鉴权在 server components 中处理
export function middleware(_req: NextRequest) {
  // 让请求继续，在页面/server component 中通过 getCurrentUser 鉴权
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
