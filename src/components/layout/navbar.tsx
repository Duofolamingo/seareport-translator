import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Languages, LogIn } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Languages className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight">AI 赋能跨境电商</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/translate">翻译中心</NavLink>
          <NavLink href="/standards">标准查询</NavLink>
          <NavLink href="/pricing">定价</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              登录
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/translate">立即翻译</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
