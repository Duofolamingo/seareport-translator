// 翻译主流程 - 串联 OCR → 翻译 → 标准映射 → 文档生成
// 由 API Route 异步调用（也可由独立 worker 调用）

import { prisma } from "@/lib/prisma";
import { extractPdfText, runOcr, type OcrResult } from "./ocr";
import { translateText, type TargetLang } from "./translate";
import { findStandardMappings, extractGbStandards, generateStandardSheetHtml, COUNTRY_LABEL, COUNTRY_LABEL_EN } from "./standardMapper";
import { generatePdf, savePdf } from "./pdfGenerator";
import { generateWord, saveWord } from "./wordGenerator";
import { publishProgress } from "./sse";
import { readFile } from "fs/promises";
import { join } from "path";
import { LANGUAGES } from "@/lib/constants";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export type PipelineInput = {
  orderId: string;
  fileUrl: string;
  fileName: string;
  fileType: "PDF" | "IMAGE";
  targetLang: TargetLang;
  outputFormat: "PDF" | "WORD" | "COMPARISON";
};

export async function runTranslationPipeline(input: PipelineInput): Promise<void> {
  const { orderId, fileUrl, fileName, fileType, targetLang, outputFormat } = input;
  const lang = LANGUAGES.find((l) => l.code === targetLang);
  if (!lang) throw new Error("Invalid target language");

  try {
    // === 1. OCR / 文本提取 ===
    await updateOrderStatus(orderId, "OCR_PROCESSING", 10, "正在识别文档内容...");
    const localPath = resolveLocalPath(fileUrl);
    const buffer = await readFile(localPath);
    let ocrResult: OcrResult;

    if (fileType === "PDF") {
      const text = await extractPdfText(buffer);
      if (text.trim().length > 50) {
        ocrResult = {
          text,
          pages: 1,
          reportType: "OTHER",
          gbStandards: extractGbStandards(text),
          blocks: [{ page: 1, text }],
        };
      } else {
        ocrResult = await runOcr(buffer, "application/pdf", fileName);
      }
    } else {
      ocrResult = await runOcr(buffer, "image/*", fileName);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        ocrText: ocrResult.text,
        reportType: ocrResult.reportType,
        pageCount: ocrResult.pages,
      },
    });

    // === 2. 翻译 ===
    await updateOrderStatus(orderId, "TRANSLATING", 35, "正在翻译文本...");
    const translated = await translateText(ocrResult.text, targetLang);

    await prisma.order.update({
      where: { id: orderId },
      data: { translatedText: translated },
    });

    // === 3. 标准映射 ===
    await updateOrderStatus(orderId, "TRANSLATING", 65, "正在匹配标准对照表...");
    const mappings = await findStandardMappings(ocrResult.gbStandards, lang.country, ocrResult.reportType);
    const standardSheetHtml = generateStandardSheetHtml(mappings, COUNTRY_LABEL[lang.country], lang.nameEn);

    await prisma.order.update({
      where: { id: orderId },
      data: { standardSheet: JSON.stringify({ mappings, targetCountry: lang.country, targetLang }) },
    });

    // === 4. 文档生成 ===
    await updateOrderStatus(orderId, "GENERATING", 85, "正在生成翻译文档...");
    const fullHtml = buildReportHtml({
      title: `Quality Inspection Report - ${lang.nameEn}`,
      fileName,
      sourceText: ocrResult.text,
      translatedText: translated,
      standardSheetHtml,
    });

    const timestamp = Date.now();
    let pdfUrl: string | null = null;
    let wordUrl: string | null = null;
    let comparisonUrl: string | null = null;

    if (outputFormat === "PDF" || outputFormat === "COMPARISON") {
      const pdfBuf = await generatePdf(fullHtml);
      pdfUrl = await savePdf(pdfBuf, `${orderId}-${timestamp}.pdf`);
    }
    if (outputFormat === "WORD" || outputFormat === "COMPARISON") {
      const wordBuf = await generateWord(`Quality Inspection Report`, fullHtml, targetLang);
      wordUrl = await saveWord(wordBuf, `${orderId}-${timestamp}.docx`);
    }
    if (outputFormat === "COMPARISON") {
      const comparisonHtml = buildReportHtml({
        title: `Bilingual Comparison Report - ${lang.nameEn}`,
        fileName,
        sourceText: ocrResult.text,
        translatedText: translated,
        standardSheetHtml,
        bilingual: true,
      });
      const compBuf = await generatePdf(comparisonHtml);
      comparisonUrl = await savePdf(compBuf, `${orderId}-${timestamp}-comparison.pdf`);
    }

    // === 5. 完成 ===
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        progress: 100,
        progressMessage: "翻译完成！",
        completedAt: new Date(),
        translatedUrl: pdfUrl,
        wordUrl,
        comparisonUrl,
      },
    });

    await publishProgress(orderId, {
      status: "COMPLETED",
      progress: 100,
      message: "翻译完成！",
      downloadUrl: pdfUrl || wordUrl || comparisonUrl || undefined,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "翻译失败";
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "FAILED",
        errorMessage,
        progress: 0,
        progressMessage: errorMessage,
      },
    });
    await publishProgress(orderId, {
      status: "FAILED",
      progress: 0,
      message: errorMessage,
      errorMessage,
    });
    throw err;
  }
}

function resolveLocalPath(url: string): string {
  // /api/upload/xxx → ./uploads/xxx
  const file = url.replace(/^\/api\/upload\//, "").replace(/^\/api\/download\//, "");
  return join(process.cwd(), UPLOAD_DIR, file);
}

async function updateOrderStatus(
  orderId: string,
  status: "PENDING" | "OCR_PROCESSING" | "TRANSLATING" | "GENERATING" | "COMPLETED" | "FAILED",
  progress: number,
  message: string
): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: { status, progress, progressMessage: message },
  });
  await publishProgress(orderId, { status, progress, message });
}

function buildReportHtml(opts: {
  title: string;
  fileName: string;
  sourceText: string;
  translatedText: string;
  standardSheetHtml: string;
  bilingual?: boolean;
}): string {
  const { title, fileName, sourceText, translatedText, standardSheetHtml, bilingual } = opts;

  const stampsHtml = `
<div class="stamps">
  <div class="stamp cma">
    <div class="stamp-inner">
      <div class="stamp-text">CMA</div>
      <div class="stamp-sub">检验检测机构<br/>资质认定</div>
    </div>
  </div>
  <div class="stamp ccc">
    <div class="stamp-inner">
      <div class="stamp-text">CCC</div>
      <div class="stamp-sub">中国强制认证</div>
    </div>
  </div>
</div>`;

  const stampsCss = `
.stamps { position: absolute; top: 20px; right: 20px; display: flex; gap: 16px; z-index: 100; }
.stamp { width: 90px; height: 70px; display: flex; align-items: center; justify-content: center; font-family: "SimHei", "Microsoft YaHei", sans-serif; }
.stamp-inner { text-align: center; width: 100%; }
.stamp.cma { border: 3px solid #dc2626; border-radius: 50%; padding: 4px; }
.stamp.cma .stamp-inner { border: 2px solid #dc2626; border-radius: 45%; padding: 6px 2px; }
.stamp.cma .stamp-text { color: #dc2626; font-size: 20px; font-weight: bold; letter-spacing: 2px; }
.stamp.cma .stamp-sub { color: #dc2626; font-size: 7px; line-height: 1.2; margin-top: 2px; }
.stamp.ccc { border: 3px solid #000; border-radius: 50%; padding: 4px; }
.stamp.ccc .stamp-inner { border: 2px solid #000; border-radius: 45%; padding: 8px 2px; }
.stamp.ccc .stamp-text { color: #000; font-size: 20px; font-weight: bold; letter-spacing: 2px; }
.stamp.ccc .stamp-sub { color: #000; font-size: 7px; line-height: 1.2; margin-top: 2px; }`;

  if (bilingual) {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escape(title)}</title>
<style>
body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; padding: 20px; line-height: 1.6; color: #0f172a; position: relative; }
h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-right: 220px; }
h2 { color: #1e40af; margin-top: 30px; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.col { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
.col h3 { margin: 0 0 8px; color: #475569; font-size: 13px; }
.standard-sheet { margin-top: 30px; padding: 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
.standard-sheet table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.standard-sheet th, .standard-sheet td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
.standard-sheet th { background: #f1f5f9; }
.meta { color: #64748b; font-size: 12px; margin-bottom: 16px; }
${stampsCss}
</style></head><body>
${stampsHtml}
<h1>${escape(title)}</h1>
<div class="meta">源文件: ${escape(fileName)} | 生成时间: ${new Date().toLocaleString("zh-CN")} | SeaReport Translator</div>
<h2>双语对照 / Bilingual Comparison</h2>
<div class="cols">
  <div class="col"><h3>原文 (中文)</h3><pre style="white-space:pre-wrap; font-family: inherit; margin:0;">${escape(sourceText)}</pre></div>
  <div class="col"><h3>译文 (Translation)</h3><pre style="white-space:pre-wrap; font-family: inherit; margin:0;">${escape(translatedText)}</pre></div>
</div>
${standardSheetHtml}
</body></html>`;
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escape(title)}</title>
<style>
body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; padding: 20px; line-height: 1.6; color: #0f172a; position: relative; }
h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-right: 220px; }
h2 { color: #1e40af; margin-top: 30px; }
pre { white-space: pre-wrap; font-family: inherit; }
.meta { color: #64748b; font-size: 12px; margin-bottom: 16px; }
.standard-sheet { margin-top: 30px; padding: 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
.standard-sheet table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.standard-sheet th, .standard-sheet td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
.standard-sheet th { background: #f1f5f9; }
${stampsCss}
</style></head><body>
${stampsHtml}
<h1>${escape(title)}</h1>
<div class="meta">源文件: ${escape(fileName)} | 生成时间: ${new Date().toLocaleString("zh-CN")} | SeaReport Translator</div>
<h2>翻译正文 / Translated Content</h2>
<pre>${escape(translatedText)}</pre>
${standardSheetHtml}
</body></html>`;
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
