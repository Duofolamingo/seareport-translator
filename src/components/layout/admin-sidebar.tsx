"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FileText, Library, BookOpen, Settings, ShieldCheck } from "lucide-react";

const items = [
  { href: "/admin", label: "数据看板", icon: LayoutDashboard },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/orders", label: "订单管理", icon: FileText },
  { href: "/admin/standards", label: "标准库", icon: Library },
  { href: "/admin/terms", label: "术语库", icon: BookOpen },
  { href: "/admin/settings", label: "系统设置", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-slate-900 text-slate-200 md:block">
      <div className="sticky top-16 px-3 py-6">
        <div className="mb-4 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <ShieldCheck className="h-4 w-4" />
          管理后台
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
