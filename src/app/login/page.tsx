"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/dashboard";
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"password" | "code">("password");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const sendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      toast({ title: "请输入正确的手机号", variant: "destructive" });
      return;
    }
    setSendingCode(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const j = await res.json();
      if (!j.success) throw new Error(j.error);
      toast({
        title: "验证码已发送",
        description: j.data?.devCode ? `开发环境验证码: ${j.data.devCode}` : "请查收短信",
        variant: "success",
      });
      setCountdown(60);
      const t = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(t);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      toast({ title: "发送失败", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSendingCode(false);
    }
  };

  const handleLogin = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      toast({ title: "请输入正确的手机号", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          ...(mode === "password" ? { password } : { code }),
        }),
      });
      const j = await res.json();
      if (!j.success) throw new Error(j.error);
      toast({ title: "登录成功", variant: "success" });
      router.push(redirect);
      router.refresh();
    } catch (err) {
      toast({ title: "登录失败", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Languages className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">AI 赋能跨境电商</h1>
          <p className="mt-1 text-sm text-slate-500">产品计量认证国际互认应用平台</p>
        </div>

        <div className="mt-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === "password" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            密码登录
          </button>
          <button
            type="button"
            onClick={() => setMode("code")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === "code" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            验证码登录
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">手机号</label>
            <Input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              className="mt-1"
            />
          </div>

          {mode === "password" ? (
            <div>
              <label className="text-sm font-medium text-slate-700">密码</label>
              <Input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-slate-700">验证码</label>
              <div className="mt-1 flex gap-2">
                <Input
                  type="text"
                  placeholder="6 位验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendCode}
                  disabled={sendingCode || countdown > 0}
                  className="shrink-0"
                >
                  {sendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : "获取验证码"}
                </Button>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "登录"}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          还没有账号？{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            立即注册
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function LoginFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex h-96 items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
