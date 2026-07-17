import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Server, Key, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">系统设置</h1>
        <p className="mt-1 text-sm text-slate-500">配置 API 密钥、套餐和系统参数</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              第三方 API 密钥
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Setting label="Google Cloud Translate" value="已配置" status="ok" />
            <Setting label="Google Cloud Vision (OCR)" value="已配置" status="ok" />
            <Setting label="阿里云机器翻译（备用）" value="未配置" status="warn" />
            <Setting label="阿里云 OSS 存储" value="未配置" status="warn" />
            <Setting label="阿里云短信" value="未配置" status="warn" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              套餐配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Setting label="FREE - 每月翻译次数" value="1" />
            <Setting label="BASIC - 每月翻译次数" value="10" />
            <Setting label="PRO - 每月翻译次数" value="30" />
            <Setting label="ENTERPRISE - 每月翻译次数" value="无限" />
            <Setting label="单文件最大尺寸" value="50 MB" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              支持语言
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            泰语 / 越南语 / 印尼语 / 马来语 / 柬埔寨语 / 缅甸语 / 老挝语
            <p className="mt-2 text-xs text-slate-500">共 7 种东南亚官方语言</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              系统信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">版本</span>
              <span className="font-mono text-slate-900">v0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">数据库</span>
              <span className="font-mono text-slate-900">PostgreSQL 15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">缓存</span>
              <span className="font-mono text-slate-900">Redis 7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">存储</span>
              <span className="font-mono text-slate-900">Local / OSS</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Setting({ label, value, status }: { label: string; value: string; status?: "ok" | "warn" }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        {status && (
          <span
            className={`h-2 w-2 rounded-full ${
              status === "ok" ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        )}
        <span className="font-medium text-slate-900">{value}</span>
      </div>
    </div>
  );
}
