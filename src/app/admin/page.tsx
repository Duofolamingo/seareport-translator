import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle2, XCircle, TrendingUp, Globe } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminHome() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, totalOrders, todayOrders, completed, failed, recent, byLanguage] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "FAILED" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { phone: true, name: true, company: true } } },
    }),
    prisma.order.groupBy({ by: ["targetLang"], _count: true }),
  ]);

  const successRate = totalOrders > 0 ? Math.round((completed / totalOrders) * 100) : 0;

  const stats = [
    { label: "总用户", value: totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "总订单", value: totalOrders, icon: FileText, color: "text-slate-600", bg: "bg-slate-100" },
    { label: "今日订单", value: todayOrders, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "成功率", value: `${successRate}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">数据看板</h1>
        <p className="mt-1 text-sm text-slate-500">实时业务概览</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{s.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                  <s.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>最近订单</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">用户</th>
                    <th className="px-4 py-3 text-left">文件</th>
                    <th className="px-4 py-3 text-left">语言</th>
                    <th className="px-4 py-3 text-left">状态</th>
                    <th className="px-4 py-3 text-left">时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((o) => {
                    const lang = LANGUAGES.find((l) => l.code === o.targetLang);
                    return (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="text-slate-900">{o.user.name || o.user.phone}</div>
                          {o.user.company && <div className="text-xs text-slate-500">{o.user.company}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders`} className="text-slate-900 hover:text-blue-600">
                            {o.fileName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{lang ? `${lang.flag} ${lang.name}` : o.targetLang}</td>
                        <td className="px-4 py-3">
                          <Badge className={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              语言分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byLanguage
                .sort((a, b) => b._count - a._count)
                .map((b) => {
                  const lang = LANGUAGES.find((l) => l.code === b.targetLang);
                  const total = byLanguage.reduce((s, x) => s + x._count, 0);
                  const pct = total > 0 ? Math.round((b._count / total) * 100) : 0;
                  return (
                    <div key={b.targetLang}>
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {lang?.flag} {lang?.name || b.targetLang}
                        </span>
                        <span className="font-medium text-slate-900">
                          {b._count} ({pct}%)
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
