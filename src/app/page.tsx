import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/constants";
import { ArrowRight, Upload, Languages, FileCheck, Sparkles, ShieldCheck, Zap, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-blue-50/40 to-slate-50">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(37,99,235,0.08),transparent)]" />
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                专为跨境电商打造 · AI 翻译 + 标准智能映射
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                AI 赋能跨境电商
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  产品计量认证国际互认应用
                </span>
              </h1>
              <p className="mt-6 text-base text-slate-600 sm:text-lg">
                智能翻译产品质检报告，自动匹配国际标准，助力企业跨境贸易合规高效。
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/translate">
                    立即翻译
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/standards">查看标准库</Link>
                </Button>
              </div>
            </div>

            {/* 国旗横排 */}
            <div className="mt-16">
              <p className="text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                支持 7 种东南亚官方语言
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {LANGUAGES.map((l) => (
                  <div
                    key={l.code}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="text-2xl leading-none">{l.flag}</span>
                    <span className="font-medium text-slate-700">{l.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 流程 */}
        <section className="border-b border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">三步完成翻译</h2>
              <p className="mt-3 text-slate-600">从上传质检报告到下载翻译结果，只需 5 分钟</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Upload,
                  title: "1. 上传报告",
                  desc: "支持 PDF / JPG / PNG，单文件最大 50MB。系统自动识别扫描件或原生文档。",
                },
                {
                  icon: Languages,
                  title: "2. 选择语言 + AI 翻译",
                  desc: "选择目标语言（7 种东南亚语言），系统自动 OCR 识别 + 术语保护 + AI 翻译 + 标准映射。",
                },
                {
                  icon: FileCheck,
                  title: "3. 下载结果",
                  desc: "生成 PDF / Word / 双语对照版，报告末尾自动附加中-外标准对照表。",
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 核心价值 */}
        <section className="border-b border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  为什么选择我们？
                </h2>
                <p className="mt-4 text-slate-600">
                  传统人工翻译一份质检报告需要 1-2 天，价格 500-2000 元。
                  我们通过 AI 自动化，将时间和成本压缩到 5 分钟和几元钱。
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    {
                      icon: Zap,
                      title: "5 分钟出结果",
                      desc: "上传后无需等待，AI 自动完成 OCR、翻译、文档生成全流程。",
                    },
                    {
                      icon: Globe,
                      title: "7 国语言全覆盖",
                      desc: "泰语、越南语、印尼语、马来语、柬埔寨语、缅甸语、老挝语。",
                    },
                    {
                      icon: ShieldCheck,
                      title: "标准智能映射",
                      desc: "自动识别 GB 标准并匹配目标国对应标准，附页一目了然。",
                    },
                  ].map((f) => (
                    <div key={f.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <f.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{f.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-500">翻译报告 / Translation Report</div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">已完成</span>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">源文件</span>
                      <span className="text-slate-900">QC-Report-2026.pdf</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">目标语言</span>
                      <span className="flex items-center gap-1 text-slate-900">🇹🇭 泰语</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">检测项目</span>
                      <span className="text-slate-900">3 项</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">识别 GB 标准</span>
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700">GB 18401-2010</span>
                    </div>
                  </div>
                  <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs">
                    <div className="font-semibold text-blue-900">标准对照表</div>
                    <div className="mt-1 text-blue-700">
                      GB 18401-2010 → TIS 223 (泰国纺织产品安全标准)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              立即开始第一次翻译
            </h2>
            <p className="mt-3 text-base text-blue-100">
              免费注册即享 1 次翻译额度，无需信用卡。
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/translate">
                  免费试用
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 sm:w-auto"
              >
                <Link href="/pricing">查看套餐</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
