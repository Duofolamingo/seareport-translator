"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users as UsersIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type User = {
  id: string;
  phone: string;
  name: string | null;
  company: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useSWR<{ success: boolean; data: { items: User[]; total: number } }>(
    `/api/admin/users?search=${encodeURIComponent(search)}`,
    fetcher
  );

  const items = data?.data?.items || [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
          <p className="mt-1 text-sm text-slate-500">共 {data?.data?.total || 0} 位用户</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="搜索手机号 / 姓名 / 公司"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-slate-500">加载中...</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <UsersIcon className="mb-2 h-8 w-8 text-slate-300" />
              <p>暂无用户</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">手机号</th>
                  <th className="px-4 py-3 text-left">姓名</th>
                  <th className="px-4 py-3 text-left">公司</th>
                  <th className="px-4 py-3 text-left">角色</th>
                  <th className="px-4 py-3 text-left">订单数</th>
                  <th className="px-4 py-3 text-left">注册时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.phone}</td>
                    <td className="px-4 py-3">{u.name || "-"}</td>
                    <td className="px-4 py-3">{u.company || "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                        {u.role === "ADMIN" ? "管理员" : "用户"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{u._count.orders}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
