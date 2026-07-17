"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Settings, ChevronRight } from "lucide-react";

const items = [
  { href: "/dashboard", label: "工作台", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "我的订单", icon: FileText },
  { href: "/dashboard/settings", label: "账户设置", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="sticky top-16 px-3 py-6">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                  {item.label}
                </span>
                {active && <ChevronRight className="h-4 w-4 text-blue-600" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
