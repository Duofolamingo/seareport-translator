"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, FileText, RefreshCw, Globe, ChevronDown, ChevronUp, FileType, Eye } from "lucide-react";
import { LANGUAGES, REPORT_TYPE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type StandardMatch = {
  gbStandard: string;
  gbName: string;
  targetCountry: string;
  targetStandard: string;
  targetName: string;
  productCategory: string;
  notes: string | null;
};

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [showStandard, setShowStandard] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setOrder(j.data);
        setLoading(false);
      });
  }, [orderId]);

  if (loading || !order) {
    return <div className="flex min-h-[60vh] items-center justify-center text-slate-500">加载中...</div>;
  }

  const lang = LANGUAGES.find((l) => l.code === order.targetLang);
  const standards: StandardMatch[] = (order.standardSheet as any)?.mappings || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 标题 */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">翻译完成！</h1>
        <p className="mt-1 text-sm text-slate-500">完成时间：{formatDate(order.completedAt)}</p>
      </div>

      {/* 文件信息卡 */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Info label="文件名" value={order.fileName} />
            <Info label="目标语言" value={lang ? `${lang.flag} ${lang.name}` : order.targetLang} />
            <Info label="输出格式" value={order.outputFormat} />
            <Info
              label="报告类型"
              value={order.reportType ? REPORT_TYPE_LABEL[order.reportType as keyof typeof REPORT_TYPE_LABEL] : "未识别"}
            />
          </div>
        </CardContent>
      </Card>

      {/* 预览按钮 */}
      {order.translatedUrl && (
        <div className="mt-6">
          <Button asChild className="w-full" size="lg">
            <Link href={`/translate/preview/${order.id}`}>
              <Eye className="mr-2 h-5 w-5" />
              在线预览翻译报告
            </Link>
          </Button>
        </div>
      )}

      {/* 下载按钮 */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {order.translatedUrl && (
          <DownloadCard
            href={order.translatedUrl}
            title="PDF 翻译版"
            desc="完整翻译报告 PDF"
            icon={<FileText className="h-5 w-5" />}
          />
        )}
        {order.wordUrl && (
          <DownloadCard
            href={order.wordUrl}
            title="Word 翻译版"
            desc="可编辑 .docx 文件"
            icon={<FileType className="h-5 w-5" />}
          />
        )}
        {order.comparisonUrl && (
          <DownloadCard
            href={order.comparisonUrl}
            title="双语对照版"
            desc="中-外对照 + 标准表"
            icon={<Globe className="h-5 w-5" />}
          />
        )}
      </div>

      {/* 标准对照表 */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>标准对照表</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowStandard(!showStandard)}>
              {showStandard ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {showStandard && (
          <CardContent>
            {standards.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                本次翻译未识别到对应的 GB 标准，未生成标准对照表。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">GB 标准</th>
                      <th className="px-3 py-2 text-left">目标国标准</th>
                      <th className="px-3 py-2 text-left">差异说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {standards.map((m, i) => (
                      <tr key={i}>
                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-900">{m.gbStandard}</div>
                          <div className="text-xs text-slate-500">{m.gbName}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-blue-700">{m.targetStandard}</div>
                          <div className="text-xs text-slate-500">{m.targetName}</div>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">{m.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* 重新翻译 */}
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/translate">
            <RefreshCw className="h-4 w-4" />
            翻译其他报告
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard/orders">查看订单历史</Link>
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-slate-900" title={value}>
        {value}
      </p>
    </div>
  );
}

function DownloadCard({ href, title, desc, icon }: { href: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          {icon}
        </div>
        <Download className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
      </div>
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </a>
  );
}
