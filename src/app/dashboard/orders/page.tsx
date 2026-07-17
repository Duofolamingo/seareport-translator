"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, RotateCw, Filter } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, LANGUAGES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

const STATUS_OPTIONS = [
  { value: "", label: "全部" },
  { value: "PENDING", label: "待处理" },
  { value: "OCR_PROCESSING", label: "识别中" },
  { value: "TRANSLATING", label: "翻译中" },
  { value: "GENERATING", label: "生成中" },
  { value: "COMPLETED", label: "已完成" },
  { value: "FAILED", label: "失败" },
];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Order = {
  id: string;
  fileName: string;
  targetLang: string;
  outputFormat: string;
  status: keyof typeof ORDER_STATUS_LABEL;
  createdAt: string;
  completedAt: string | null;
  translatedUrl: string | null;
  errorMessage: string | null;
};

export default function OrdersPage() {
  const [status, setStatus] = useState("");
  const { data, mutate } = useSWR<{ success: boolean; data: { items: Order[] } }>(
    `/api/orders${status ? `?status=${status}` : ""}`,
    fetcher
  );

  const items = data?.data?.items || [];

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该订单？此操作不可恢复。")) return;
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (j.success) {
      toast({ title: "已删除", variant: "success" });
      mutate();
    } else {
      toast({ title: "删除失败", description: j.error, variant: "destructive" });
    }
  };

  const handleRetry = async (id: string) => {
    const res = await fetch(`/api/orders/${id}/retry`, { method: "POST" });
    const j = await res.json();
    if (j.success) {
      toast({ title: "已重新加入队列", variant: "success" });
      mutate();
    } else {
      toast({ title: "重试失败", description: j.error, variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">我的订单</h1>
          <p className="mt-1 text-sm text-slate-500">查看所有翻译历史</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              status === s.value
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FileText className="mb-2 h-10 w-10 text-slate-300" />
              <p>暂无订单</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">文件名</th>
                    <th className="px-4 py-3 text-left">目标语言</th>
                    <th className="px-4 py-3 text-left">格式</th>
                    <th className="px-4 py-3 text-left">状态</th>
                    <th className="px-4 py-3 text-left">创建时间</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((o) => {
                    const lang = LANGUAGES.find((l) => l.code === o.targetLang);
                    return (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/orders/${o.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600"
                          >
                            {o.fileName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {lang ? `${lang.flag} ${lang.name}` : o.targetLang}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{o.outputFormat}</td>
                        <td className="px-4 py-3">
                          <Badge className={ORDER_STATUS_COLOR[o.status]}>
                            {ORDER_STATUS_LABEL[o.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            {o.status === "FAILED" && (
                              <Button variant="ghost" size="icon" onClick={() => handleRetry(o.id)}>
                                <RotateCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)}>
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
