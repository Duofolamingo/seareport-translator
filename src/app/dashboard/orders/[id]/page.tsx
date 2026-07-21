"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, RefreshCw, FileText, FileType, Globe, AlertCircle, Eye } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, LANGUAGES, REPORT_TYPE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type Order = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  targetLang: string;
  outputFormat: string;
  status: keyof typeof ORDER_STATUS_LABEL;
  reportType: string | null;
  createdAt: string;
  completedAt: string | null;
  progress: number;
  progressMessage: string | null;
  translatedUrl: string | null;
  wordUrl: string | null;
  comparisonUrl: string | null;
  errorMessage: string | null;
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setOrder(j.data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-slate-500">加载中...</div>;
  if (!order) return <div className="text-slate-500">订单不存在</div>;

  const lang = LANGUAGES.find((l) => l.code === order.targetLang);

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4" />
        返回
      </Button>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{order.fileName}</h1>
          <p className="mt-1 text-sm text-slate-500">订单 ID: {order.id}</p>
        </div>
        <Badge className={ORDER_STATUS_COLOR[order.status]}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>任务详情</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Item label="目标语言" value={lang ? `${lang.flag} ${lang.name}` : order.targetLang} />
              <Item label="输出格式" value={order.outputFormat} />
              <Item label="文件类型" value={order.fileType} />
              <Item
                label="报告类型"
                value={order.reportType ? REPORT_TYPE_LABEL[order.reportType as keyof typeof REPORT_TYPE_LABEL] : "未识别"}
              />
              <Item label="创建时间" value={formatDate(order.createdAt)} />
              <Item label="完成时间" value={order.completedAt ? formatDate(order.completedAt) : "-"} />
              <Item label="进度" value={`${order.progress}%`} />
              <Item label="当前状态" value={order.progressMessage || "-"} />
            </dl>

            {order.errorMessage && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">错误信息</p>
                  <p className="mt-1 text-xs">{order.errorMessage}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>下载</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.status !== "COMPLETED" ? (
              <p className="text-sm text-slate-500">任务尚未完成</p>
            ) : (
              <>
                {order.translatedUrl && (
                  <Link href={`/translate/preview/${order.id}`} className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 p-3 hover:border-blue-300 hover:bg-blue-50">
                    <span className="flex items-center gap-2 text-sm font-medium text-blue-700">
                      <Eye className="h-4 w-4" /> 在线预览
                    </span>
                  </Link>
                )}
                {order.translatedUrl && (
                  <DownloadLink
                    href={order.translatedUrl}
                    fileName={`${order.fileName.replace(/\.[^.]+$/, '')}_翻译版.${order.outputFormat === 'PNG' ? 'png' : order.outputFormat === 'JPG' ? 'jpg' : 'pdf'}`}
                    label="翻译版"
                    icon={<FileText className="h-4 w-4 text-blue-600" />}
                  />
                )}
                {order.wordUrl && (
                  <DownloadLink
                    href={order.wordUrl}
                    fileName={`${order.fileName.replace(/\.[^.]+$/, '')}_翻译版.docx`}
                    label="Word 版"
                    icon={<FileType className="h-4 w-4 text-blue-600" />}
                  />
                )}
                {order.comparisonUrl && (
                  <DownloadLink
                    href={order.comparisonUrl}
                    fileName={`${order.fileName.replace(/\.[^.]+$/, '')}_双语对照版.pdf`}
                    label="双语对照"
                    icon={<Globe className="h-4 w-4 text-blue-600" />}
                  />
                )}
              </>
            )}

            {order.status === "FAILED" && (
              <Button
                className="w-full"
                variant="outline"
                onClick={async () => {
                  await fetch(`/api/orders/${order.id}/retry`, { method: "POST" });
                  window.location.reload();
                }}
              >
                <RefreshCw className="h-4 w-4" />
                重试任务
              </Button>
            )}

            <Button asChild className="w-full" variant="ghost">
              <Link href={`/translate/result/${order.id}`}>
                查看结果详情
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-900">{value}</dd>
    </div>
  );
}

function DownloadLink({ href, fileName, label, icon }: { href: string; fileName: string; label: string; icon: React.ReactNode }) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      window.open(href, "_blank");
    }
  };

  return (
    <a
      href={href}
      onClick={handleDownload}
      className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-blue-300 hover:bg-blue-50/50"
    >
      <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
        {icon} {label}
      </span>
      <Download className="h-4 w-4 text-slate-400" />
    </a>
  );
}
