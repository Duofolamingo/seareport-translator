import { getCurrentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("未登录", 401, "UNAUTHORIZED");
  return ok({ user });
}
