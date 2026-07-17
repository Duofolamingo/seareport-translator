"use client";

import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, LANGUAGES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Order = {
  id: string;
  fileName: string;
  targetLang: string;
  outputFormat: string;
  status: keyof typeof ORDER_STATUS_LABEL;
  createdAt: string;
  user: { phone: string; name: string | null; company: string | null };
};

export default function AdminOrdersPage() {
  const { data, isLoading } = useSWR<{ success: boolean; data: { items: Order[]; total: number } }>(
    "/api/admin/orders?pageSize=50",
    fetcher
  );

  const items = data?.data?.items || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">订单管理</h1>
        <p className="mt-1 text-sm text-slate-500">共 {data?.data?.total || 0} 个订单</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-slate-500">加载中...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">用户</th>
                  <th className="px-4 py-3 text-left">文件</th>
                  <th className="px-4 py-3 text-left">语言</th>
                  <th className="px-4 py-3 text-left">格式</th>
                  <th className="px-4 py-3 text-left">状态</th>
                  <th className="px-4 py-3 text-left">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((o) => {
                  const lang = LANGUAGES.find((l) => l.code === o.targetLang);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="text-slate-900">{o.user.name || o.user.phone}</div>
                        {o.user.company && <div className="text-xs text-slate-500">{o.user.company}</div>}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{o.fileName}</td>
                      <td className="px-4 py-3">{lang ? `${lang.flag} ${lang.name}` : o.targetLang}</td>
                      <td className="px-4 py-3 text-slate-600">{o.outputFormat}</td>
                      <td className="px-4 py-3">
                        <Badge className={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
