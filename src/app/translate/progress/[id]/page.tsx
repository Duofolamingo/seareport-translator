"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type ProgressEvent = {
  status?: string;
  progress?: number;
  message?: string;
  downloadUrl?: string;
  errorMessage?: string;
  done?: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "等待处理",
  OCR_PROCESSING: "OCR 识别中",
  TRANSLATING: "AI 翻译中",
  GENERATING: "生成文档中",
  COMPLETED: "翻译完成",
  FAILED: "翻译失败",
};

const STEPS = [
  { key: "OCR_PROCESSING", label: "OCR 识别" },
  { key: "TRANSLATING", label: "AI 翻译" },
  { key: "GENERATING", label: "生成文档" },
  { key: "COMPLETED", label: "完成" },
];

export default function ProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("PENDING");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("正在初始化...");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (!orderId) return;

    // 加载订单初始信息
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setOrder(j.data);
          setStatus(j.data.status);
          setProgress(j.data.progress || 0);
          setMessage(j.data.progressMessage || "处理中...");
          if (j.data.status === "COMPLETED") {
            setDownloadUrl(j.data.translatedUrl || j.data.wordUrl || j.data.comparisonUrl);
          }
        }
      })
      .catch(() => {});

    // 建立 SSE
    const connect = () => {
      const es = new EventSource(`/api/orders/${orderId}/progress`);

      es.onmessage = (e) => {
        try {
          const data: ProgressEvent = JSON.parse(e.data);
          if (data.done) {
            es.close();
            return;
          }
          if (data.status) setStatus(data.status);
          if (typeof data.progress === "number") setProgress(data.progress);
          if (data.message) setMessage(data.message);
          if (data.downloadUrl) setDownloadUrl(data.downloadUrl);
          if (data.errorMessage) setError(data.errorMessage);
        } catch {
          /* */
        }
      };

      es.onerror = () => {
        es.close();
        // 断线重连（指数退避）
        retryCountRef.current = Math.min(retryCountRef.current + 1, 5);
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        setTimeout(() => {
          if (orderId) connect();
        }, delay);
      };
    };

    connect();
  }, [orderId]);

  const completed = status === "COMPLETED";
  const failed = status === "FAILED";
  const activeStepIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {completed ? "翻译完成" : failed ? "翻译失败" : "正在翻译"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          订单 ID: <span className="font-mono text-xs">{orderId}</span>
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* 状态图标 */}
          <div className="flex justify-center">
            {completed ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
            ) : failed ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
                <XCircle className="h-10 w-10 text-rose-600" />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              </div>
            )}
          </div>

          {/* 进度条 */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                {STATUS_LABEL[status] || status}
              </span>
              <span className="font-mono text-blue-600">{progress}%</span>
            </div>
            <div className="relative mt-2">
              <Progress value={progress} className="h-2" />
              {!completed && !failed && (
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden rounded-full animate-shimmer"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">{message}</p>
          </div>

          {/* 步骤 */}
          <div className="mt-8 grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const active = i === activeStepIndex && !completed;
              const done = completed || i < activeStepIndex;
              return (
                <div key={s.key} className="text-center">
                  <div
                    className={cn(
                      "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                      done
                        ? "bg-emerald-100 text-emerald-700"
                        : active
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <p className={cn("mt-2 text-xs", done || active ? "text-slate-900" : "text-slate-400")}>
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 文件信息 */}
          {order && (
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <FileText className="h-5 w-5 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{order.fileName}</p>
                <p className="text-xs text-slate-500">
                  {order.targetLang} · {order.outputFormat}
                </p>
              </div>
              {order.status === "FAILED" && (
                <Badge variant="destructive">失败</Badge>
              )}
              {order.status === "COMPLETED" && (
                <Badge variant="success">成功</Badge>
              )}
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="mt-6 flex gap-3">
            {completed && (
              <Button asChild className="flex-1" size="lg">
                <Link href={`/translate/result/${orderId}`}>
                  查看结果
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {failed && orderId && (
              <Button
                className="flex-1"
                size="lg"
                variant="outline"
                onClick={async () => {
                  const res = await fetch(`/api/orders/${orderId}/retry`, { method: "POST" });
                  const j = await res.json();
                  if (j.success) {
                    setStatus("PENDING");
                    setProgress(0);
                    setError(null);
                    setMessage("重试中...");
                  }
                }}
              >
                重试
              </Button>
            )}
            {!completed && !failed && (
              <Button variant="outline" className="flex-1" size="lg" onClick={() => router.push("/dashboard")}>
                后台等待
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
