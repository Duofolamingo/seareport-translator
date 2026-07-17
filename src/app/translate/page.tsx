"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES, type Language } from "@/lib/constants";
import { Upload, X, FileText, Check, Loader2, ArrowRight, AlertCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { cn, formatBytes } from "@/lib/utils";

type UploadedFile = {
  file: File;
  preview?: string;
  uploadedUrl?: string;
  fileType: "PDF" | "IMAGE";
};

const OUTPUT_OPTIONS = [
  { value: "PDF" as const, label: "PDF", desc: "翻译报告 PDF" },
  { value: "WORD" as const, label: "Word", desc: "可编辑 .docx 文件" },
  { value: "COMPARISON" as const, label: "双语对照版", desc: "PDF + 双语对照 + 标准表" },
];

export default function TranslatePage() {
  const router = useRouter();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [targetLang, setTargetLang] = useState<Language["code"]>("TH");
  const [outputFormat, setOutputFormat] = useState<"PDF" | "WORD" | "COMPARISON">("PDF");
  const submittingRef = useRef(false);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (accepted.length === 0) return;
    const f = accepted[0];
    if (f.size > 50 * 1024 * 1024) {
      toast({ title: "文件过大", description: "单文件不能超过 50MB", variant: "destructive" });
      return;
    }
    const fileType: "PDF" | "IMAGE" = f.type === "application/pdf" ? "PDF" : "IMAGE";
    const preview = f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined;
    setFile({ file: f, preview, fileType });
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", f);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setFile((prev) => (prev ? { ...prev, uploadedUrl: json.data.fileUrl } : null));
      toast({ title: "上传成功", description: f.name, variant: "success" });
    } catch (err) {
      toast({ title: "上传失败", description: (err as Error).message, variant: "destructive" });
      setFile(null);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!file?.uploadedUrl) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: file.uploadedUrl,
          fileName: file.file.name,
          fileType: file.fileType,
          targetLang,
          outputFormat,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        if (res.status === 401) {
          toast({ title: "请先登录", description: "登录后即可开始翻译", variant: "destructive" });
          router.push(`/login?redirect=/translate`);
          return;
        }
        throw new Error(json.error);
      }
      router.push(`/translate/progress/${json.data.orderId}`);
    } catch (err) {
      toast({ title: "提交失败", description: (err as Error).message, variant: "destructive" });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 sm:p-6 lg:grid-cols-5 lg:p-8">
      {/* 左侧：上传 */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>上传质检报告</CardTitle>
            <p className="text-sm text-slate-500">支持 PDF / JPG / PNG，单文件最大 50MB</p>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                {...getRootProps()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 px-6 py-16 text-center transition-colors",
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/50"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mt-4 text-base font-medium text-slate-900">
                  {isDragActive ? "松开鼠标上传" : "拖拽文件到此处，或点击选择"}
                </p>
                <p className="mt-1 text-sm text-slate-500">PDF · JPG · PNG · 最大 50MB</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {file.fileType === "PDF" ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                        <FileText className="h-6 w-6" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-200">
                        {file.preview ? (
                          <img src={file.preview} alt={file.file.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-full w-full p-2 text-slate-400" />
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{file.file.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(file.file.size)} · {file.fileType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                    {!uploading && file.uploadedUrl && (
                      <Badge variant="success">
                        <Check className="mr-1 h-3 w-3" /> 已上传
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFile(null);
                        if (file.preview) URL.revokeObjectURL(file.preview);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">建议</p>
                <p className="mt-0.5 text-blue-600/80">
                  上传清晰的扫描件或原生 PDF 可以获得更准确的翻译结果。系统会自动识别报告类型并匹配相应的 GB 标准。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧：设置 */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>目标语言</CardTitle>
            <p className="text-sm text-slate-500">选择翻译的目标东南亚语言</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setTargetLang(lang.code)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                    targetLang === lang.code
                      ? "border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-xs text-slate-500">{lang.nameEn}</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>输出格式</CardTitle>
            <p className="text-sm text-slate-500">选择下载文件的格式</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {OUTPUT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOutputFormat(opt.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all",
                    outputFormat === opt.value
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div>
                    <div className="font-medium text-slate-900">{opt.label}</div>
                    <div className="text-xs text-slate-500">{opt.desc}</div>
                  </div>
                  {outputFormat === opt.value && <Check className="h-4 w-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          size="lg"
          className="w-full"
          disabled={!file?.uploadedUrl || uploading || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              开始翻译
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
