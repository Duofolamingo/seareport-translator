import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, CheckCircle2, XCircle, Loader2, Layers, Globe } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, LANGUAGES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [total, completed, processing, failed, recent] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.count({ where: { userId: user.id, status: "COMPLETED" } }),
    prisma.order.count({ where: { userId: user.id, status: { in: ["PENDING", "OCR_PROCESSING", "TRANSLATING", "GENERATING"] } } }),
    prisma.order.count({ where: { userId: user.id, status: "FAILED" } }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "总任务", value: total, icon: Layers, color: "text-slate-600", bg: "bg-slate-100" },
    { label: "已完成", value: completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "进行中", value: processing, icon: Loader2, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "失败", value: failed, icon: XCircle, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">欢迎回来，{user.name || user.phone}</h1>
        <p className="mt-1 text-sm text-slate-500">查看您的翻译任务概况</p>
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
            <div className="flex items-center justify-between">
              <CardTitle>最近任务</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/orders">
                  查看全部
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-slate-500">
                <FileText className="mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm">还没有翻译任务</p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/translate">开始翻译</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recent.map((o) => {
                  const lang = LANGUAGES.find((l) => l.code === o.targetLang);
                  return (
                    <Link
                      key={o.id}
                      href={`/dashboard/orders/${o.id}`}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50"
                    >
                      <FileText className="h-5 w-5 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{o.fileName}</p>
                        <p className="text-xs text-slate-500">
                          {lang?.flag} {lang?.name} · {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <Badge className={ORDER_STATUS_COLOR[o.status as keyof typeof ORDER_STATUS_COLOR]}>
                        {ORDER_STATUS_LABEL[o.status as keyof typeof ORDER_STATUS_LABEL]}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-between" variant="outline">
              <Link href="/translate">
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  开始新翻译
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between" variant="outline">
              <Link href="/standards">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  查询标准
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between" variant="outline">
              <Link href="/pricing">
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  升级套餐
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
