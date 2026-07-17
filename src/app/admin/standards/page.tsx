"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { toast } from "@/components/ui/toaster";

const COUNTRIES = [
  { value: "THAILAND", label: "泰国" },
  { value: "VIETNAM", label: "越南" },
  { value: "INDONESIA", label: "印尼" },
  { value: "MALAYSIA", label: "马来西亚" },
  { value: "PHILIPPINES", label: "菲律宾" },
  { value: "CAMBODIA", label: "柬埔寨" },
  { value: "MYANMAR", label: "缅甸" },
  { value: "LAOS", label: "老挝" },
];

const CATEGORIES = [
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

export default function AdminStandardsPage() {
  const { data, mutate } = useSWR<{ success: boolean; data: { items: Standard[] } }>(
    "/api/standards",
    fetcher
  );
  const items = data?.data?.items || [];
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    gbStandard: "",
    gbName: "",
    targetCountry: "THAILAND",
    targetStandard: "",
    targetName: "",
    productCategory: "TEXTILE",
    notes: "",
  });

  const handleAdd = async () => {
    if (!form.gbStandard || !form.gbName || !form.targetStandard || !form.targetName) {
      toast({ title: "请填写完整必填项", variant: "destructive" });
      return;
    }
    const res = await fetch("/api/admin/standards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json();
    if (j.success) {
      toast({ title: "已添加", variant: "success" });
      setShowForm(false);
      setForm({ gbStandard: "", gbName: "", targetCountry: "THAILAND", targetStandard: "", targetName: "", productCategory: "TEXTILE", notes: "" });
      mutate();
    } else {
      toast({ title: "添加失败", description: j.error, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除？")) return;
    const res = await fetch(`/api/admin/standards/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (j.success) {
      toast({ title: "已删除", variant: "success" });
      mutate();
    } else {
      toast({ title: "删除失败", variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">标准库管理</h1>
          <p className="mt-1 text-sm text-slate-500">共 {items.length} 条标准</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          新增标准
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>新增标准映射</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="GB 标准编号 (如 GB 18401-2010)" value={form.gbStandard} onChange={(e) => setForm({ ...form, gbStandard: e.target.value })} />
              <Input placeholder="GB 标准名称" value={form.gbName} onChange={(e) => setForm({ ...form, gbName: e.target.value })} />
              <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm" value={form.targetCountry} onChange={(e) => setForm({ ...form, targetCountry: e.target.value })}>
                {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <Input placeholder="目标国标准编号" value={form.targetStandard} onChange={(e) => setForm({ ...form, targetStandard: e.target.value })} />
              <Input placeholder="目标国标准名称" value={form.targetName} onChange={(e) => setForm({ ...form, targetName: e.target.value })} />
              <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm" value={form.productCategory} onChange={(e) => setForm({ ...form, productCategory: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <Input className="col-span-2" placeholder="差异说明（选填）" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>取消</Button>
              <Button onClick={handleAdd}>保存</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">GB 标准</th>
                  <th className="px-4 py-3 text-left">目标国</th>
                  <th className="px-4 py-3 text-left">品类</th>
                  <th className="px-4 py-3 text-right">操作</th>
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
                        <div className="font-medium text-blue-700">{s.targetStandard}</div>
                        <div className="text-xs text-slate-500">{c?.label} · {s.targetName}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{s.productCategory}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
