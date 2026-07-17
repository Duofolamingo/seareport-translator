import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "FREE",
    price: "¥0",
    period: "/月",
    desc: "试用体验",
    features: [
      "每月 1 次翻译",
      "单文件 ≤ 10 页",
      "PDF / Word 输出",
      "标准对照表",
      "社区支持",
    ],
    cta: "免费注册",
    href: "/register",
    highlighted: false,
  },
  {
    name: "BASIC",
    price: "¥99",
    period: "/月",
    desc: "小卖家首选",
    features: [
      "每月 10 次翻译",
      "单文件 ≤ 30 页",
      "PDF / Word / 双语对照",
      "完整标准对照表",
      "邮件支持",
      "翻译历史保留 90 天",
    ],
    cta: "立即订阅",
    href: "/register?plan=BASIC",
    highlighted: true,
  },
  {
    name: "PRO",
    price: "¥299",
    period: "/月",
    desc: "外贸企业标配",
    features: [
      "每月 30 次翻译",
      "单文件 ≤ 100 页",
      "PDF / Word / 双语对照",
      "完整标准对照表 + 自定义",
      "优先支持（工作日 4 小时）",
      "翻译历史永久保留",
      "API 调用权限",
    ],
    cta: "立即订阅",
    href: "/register?plan=PRO",
    highlighted: false,
  },
  {
    name: "ENTERPRISE",
    price: "定制",
    period: "",
    desc: "大型出口企业",
    features: [
      "无限翻译次数",
      "无页数限制",
      "全套输出格式",
      "专属术语库 + 标准库",
      "7×24 客户经理",
      "私有部署 / SSO / SLA",
      "定制化功能开发",
    ],
    cta: "联系销售",
    href: "/register?plan=ENTERPRISE",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-50">
        <section className="bg-gradient-to-b from-white to-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                简单透明的定价
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                选择适合您业务规模的套餐，随时升级或降级
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {PLANS.map((p) => (
                <Card
                  key={p.name}
                  className={cn(
                    "relative flex flex-col",
                    p.highlighted && "border-blue-500 shadow-xl ring-2 ring-blue-500"
                  )}
                >
                  {p.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                        <Sparkles className="h-3 w-3" />
                        最受欢迎
                      </span>
                    </div>
                  )}
                  <CardContent className="flex flex-1 flex-col p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900">{p.price}</span>
                        <span className="text-sm text-slate-500">{p.period}</span>
                      </div>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className="mt-6 w-full"
                      variant={p.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      <Link href={p.href}>{p.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center text-sm text-slate-500">
              所有套餐均支持 7 天无理由退款。{""}
              <Link href="/login" className="text-blue-600 hover:underline">
                已有账号？登录
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
