import Link from "next/link";
import { Languages } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 text-slate-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Languages className="h-5 w-5" />
              </div>
              <span className="text-base font-semibold tracking-tight">SeaReport Translator</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-slate-500">
              一键翻译质检报告，轻松出海东南亚。专为跨境电商卖家打造的 AI 翻译平台。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">产品</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li><Link href="/translate" className="hover:text-slate-900">翻译中心</Link></li>
              <li><Link href="/standards" className="hover:text-slate-900">标准查询</Link></li>
              <li><Link href="/pricing" className="hover:text-slate-900">套餐定价</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">账户</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li><Link href="/login" className="hover:text-slate-900">登录</Link></li>
              <li><Link href="/dashboard" className="hover:text-slate-900">工作台</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-slate-900">我的订单</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          <p>© 2026 SeaReport Translator. 让跨境出海更简单。</p>
        </div>
      </div>
    </footer>
  );
}
