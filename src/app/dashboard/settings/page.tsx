"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User as UserIcon, Building2, LogOut } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  phone: string;
  name: string | null;
  company: string | null;
  role: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setUser(j.data.user);
          setName(j.data.user.name || "");
          setCompany(j.data.user.company || "");
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company }),
      });
      const j = await res.json();
      if (!j.success) throw new Error(j.error);
      toast({ title: "保存成功", variant: "success" });
    } catch (err) {
      toast({ title: "保存失败", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (!user) return <div className="text-slate-500">加载中...</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">账户设置</h1>
      <p className="mt-1 text-sm text-slate-500">管理个人信息和偏好</p>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              个人信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>手机号</Label>
              <Input value={user.phone} disabled className="mt-1 bg-slate-50" />
              <p className="mt-1 text-xs text-slate-500">手机号不可修改</p>
            </div>
            <div>
              <Label>姓名</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              企业信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>公司名称</Label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="请输入公司名称"
              className="mt-1"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存修改"}
          </Button>
        </div>
      </div>
    </div>
  );
}
