"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "", name: "", company: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      toast({ title: "请输入正确的手机号", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "密码至少 6 位", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!j.success) throw new Error(j.error);
      toast({ title: "注册成功", variant: "success" });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast({ title: "注册失败", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Languages className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">免费注册</h1>
            <p className="mt-1 text-sm text-slate-500">注册即享 1 次免费翻译额度</p>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700">手机号 *</label>
              <Input
                type="tel"
                placeholder="请输入手机号"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                maxLength={11}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">密码 *</label>
              <Input
                type="password"
                placeholder="至少 6 位"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">姓名</label>
              <Input
                placeholder="选填"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">公司名称</label>
              <Input
                placeholder="选填"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "注册并登录"}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            已有账号？{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              直接登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
