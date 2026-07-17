"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";

const CATEGORIES = [
  { value: "TEST_ITEM", label: "检测项目" },
  { value: "TEST_METHOD", label: "检测方法" },
  { value: "STANDARD", label: "标准" },
  { value: "CONCLUSION", label: "结论" },
  { value: "EQUIPMENT", label: "设备" },
  { value: "GENERAL", label: "通用" },
];

const LANG_FIELDS = [
  { key: "thai", label: "泰语" },
  { key: "vietnamese", label: "越南语" },
  { key: "indonesian", label: "印尼语" },
  { key: "malay", label: "马来语" },
  { key: "khmer", label: "柬埔寨语" },
  { key: "burmese", label: "缅甸语" },
  { key: "lao", label: "老挝语" },
];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Term = {
  id: string;
  chinese: string;
  thai: string | null;
  vietnamese: string | null;
  indonesian: string | null;
  malay: string | null;
  khmer: string | null;
  burmese: string | null;
  lao: string | null;
  category: string;
};

export default function AdminTermsPage() {
  const { data, mutate } = useSWR<{ success: boolean; data: { items: Term[] } }>(
    "/api/terms",
    fetcher
  );
  const items = data?.data?.items || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({
    chinese: "",
    thai: "",
    vietnamese: "",
    indonesian: "",
    malay: "",
    khmer: "",
    burmese: "",
    lao: "",
    category: "TEST_ITEM",
  });

  const handleAdd = async () => {
    if (!form.chinese) {
      toast({ title: "请填写中文", variant: "destructive" });
      return;
    }
    const res = await fetch("/api/admin/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json();
    if (j.success) {
      toast({ title: "已添加", variant: "success" });
      setShowForm(false);
      setForm({ chinese: "", thai: "", vietnamese: "", indonesian: "", malay: "", khmer: "", burmese: "", lao: "", category: "TEST_ITEM" });
      mutate();
    } else {
      toast({ title: "添加失败", description: j.error, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除？")) return;
    const res = await fetch(`/api/admin/terms/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (j.success) {
      toast({ title: "已删除", variant: "success" });
      mutate();
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">术语库管理</h1>
          <p className="mt-1 text-sm text-slate-500">共 {items.length} 条术语</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          新增术语
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>新增术语</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="中文 * " value={form.chinese} onChange={(e) => setForm({ ...form, chinese: e.target.value })} />
              <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {LANG_FIELDS.map((f) => (
                <Input
                  key={f.key}
                  placeholder={f.label}
                  value={form[f.key] || ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              ))}
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
                  <th className="px-4 py-3 text-left">中文</th>
                  <th className="px-4 py-3 text-left">分类</th>
                  <th className="px-4 py-3 text-left">泰语</th>
                  <th className="px-4 py-3 text-left">越南语</th>
                  <th className="px-4 py-3 text-left">印尼语</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{t.chinese}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{t.category}</td>
                    <td className="px-4 py-3">{t.thai || "-"}</td>
                    <td className="px-4 py-3">{t.vietnamese || "-"}</td>
                    <td className="px-4 py-3">{t.indonesian || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
