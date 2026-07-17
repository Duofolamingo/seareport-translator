"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { value: "", label: "全部国家", flag: "🌏" },
  { value: "THAILAND", label: "泰国", flag: "🇹🇭" },
  { value: "VIETNAM", label: "越南", flag: "🇻🇳" },
  { value: "INDONESIA", label: "印度尼西亚", flag: "🇮🇩" },
  { value: "MALAYSIA", label: "马来西亚", flag: "🇲🇾" },
  { value: "PHILIPPINES", label: "菲律宾", flag: "🇵🇭" },
  { value: "CAMBODIA", label: "柬埔寨", flag: "🇰🇭" },
  { value: "MYANMAR", label: "缅甸", flag: "🇲🇲" },
  { value: "LAOS", label: "老挝", flag: "🇱🇦" },
];

const CATEGORIES = [
  { value: "", label: "全部品类" },
  { value: "ELECTRONICS", label: "电子电器" },
  { value: "TEXTILE", label: "纺织品" },
  { value: "TOY", label: "玩具" },
  { value: "FOOD", label: "食品接触" },
  { value: "COSMETICS", label: "化妆品" },
  { value: "BUILDING", label: "建材" },
  { value: "FOOTWEAR", label: "鞋类" },
  { value: "OTHER", label: "其他" },
];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Standard = {
  id: string;
  gbStandard: string;
  gbName: string;
  targetCountry: string;
  targetStandard: string;
  targetName: string;
  productCategory: string;
  notes: string | null;
};

export default function StandardsPage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (country) params.set("targetCountry", country);
  if (category) params.set("productCategory", category);

  const { data, isLoading } = useSWR<{ success: boolean; data: { items: Standard[] } }>(
    `/api/standards?${params.toString()}`,
    fetcher
  );

  const items = data?.data?.items || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">标准查询</h1>
        <p className="mt-1 text-sm text-slate-500">
          搜索中国 GB 国家标准与东南亚各国对应标准的映射关系
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="relative sm:col-span-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="搜索 GB 标准或目标国标准..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:col-span-3"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.flag} {c.label}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:col-span-3"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              className="sm:col-span-1"
              onClick={() => {
                setSearch("");
                setCountry("");
                setCategory("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-slate-500">加载中...</div>
          ) : items.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-slate-500">
              <Filter className="mb-2 h-8 w-8 text-slate-300" />
              <p>没有匹配的标准</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">GB 标准</th>
                    <th className="px-4 py-3 text-left">目标国标准</th>
                    <th className="px-4 py-3 text-left">品类</th>
                    <th className="px-4 py-3 text-left">差异说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((s) => {
                    const c = COUNTRIES.find((x) => x.value === s.targetCountry);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{s.gbStandard}</div>
                          <div className="text-xs text-slate-500">{s.gbName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-blue-700">
                            {c?.flag} {s.targetStandard}
                          </div>
                          <div className="text-xs text-slate-500">{s.targetName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{s.productCategory}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{s.notes || "-"}</td>
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
