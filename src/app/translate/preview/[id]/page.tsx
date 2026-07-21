"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ZoomIn, ZoomOut, RotateCcw, FileText, Image as ImageIcon, FileType } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";

type Order = {
  id: string;
  fileName: string;
  fileType: string;
  targetLang: string;
  outputFormat: string;
  status: string;
  translatedUrl: string | null;
  wordUrl: string | null;
  comparisonUrl: string | null;
};

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        加载中...
      </div>
    );
  }

  if (!order || !order.translatedUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        无法预览：文件不存在或翻译未完成
      </div>
    );
  }

  const lang = LANGUAGES.find((l) => l.code === order.targetLang);
  const isImage = order.translatedUrl.endsWith(".png") || order.translatedUrl.endsWith(".jpg") || order.translatedUrl.endsWith(".jpeg");
  const isPdf = order.translatedUrl.endsWith(".pdf");
  const isWord = order.translatedUrl.endsWith(".docx");

  const previewUrl = isWord
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(order.translatedUrl)}&embedded=true`
    : order.translatedUrl;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* 工具栏 */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">{order.fileName}</h1>
            <p className="text-xs text-slate-500">
              {lang ? `${lang.flag} ${lang.name}` : order.targetLang} · {order.outputFormat}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(zoom + 25, 200))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-xs text-slate-500">{zoom}%</span>
              <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(zoom - 25, 50))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setRotation((rotation + 90) % 360)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button size="sm" asChild>
            <a href={order.translatedUrl} download>
              <Download className="mr-1 h-4 w-4" />
              下载
            </a>
          </Button>
        </div>
      </header>

      {/* 预览区域 */}
      <main className="flex flex-1 items-center justify-center p-4">
        {isImage ? (
          <div className="overflow-auto">
            <img
              src={previewUrl}
              alt="预览图片"
              className="max-w-full shadow-lg"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center",
                maxHeight: "calc(100vh - 120px)",
                objectFit: "contain",
              }}
            />
          </div>
        ) : isPdf ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <iframe
              src={previewUrl}
              title="PDF 预览"
              className="h-[calc(100vh-120px)] w-full max-w-6xl border-none shadow-lg"
              style={{ minHeight: "600px" }}
            />
          </div>
        ) : isWord ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <iframe
              src={previewUrl}
              title="Word 预览"
              className="h-[calc(100vh-120px)] w-full max-w-6xl border-none shadow-lg"
              style={{ minHeight: "600px" }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <FileText className="h-12 w-12" />
            <p>不支持的文件格式预览</p>
            <Button asChild>
              <a href={order.translatedUrl} download>
                <Download className="mr-1 h-4 w-4" />
                下载文件
              </a>
            </Button>
          </div>
        )}
      </main>

      {/* 文件信息 */}
      <footer className="border-t border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            {isImage ? <ImageIcon className="h-3 w-3" /> : isWord ? <FileType className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
            {order.outputFormat}
          </span>
          <span>|</span>
          <span>订单 ID: {order.id}</span>
        </div>
      </footer>
    </div>
  );
}