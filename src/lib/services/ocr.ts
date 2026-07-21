// OCR 服务 - 封装 Google Cloud Vision
// 开发环境（MOCK_OCR=true）使用模拟数据，无需真实凭证

import type { ReportType } from "@/lib/constants";

export type OcrResult = {
  text: string;
  pages: number;
  /** 检测到的报告类型 */
  reportType: ReportType;
  /** 检测到的 GB 标准编号列表 */
  gbStandards: string[];
  /** 文本块（按页） */
  blocks: { page: number; text: string }[];
};

const MOCK_SAMPLE = `
检测报告

报告编号: QC-2026-0001
检测项目: 甲醛含量、pH值、色牢度
执行标准: GB 18401-2010 国家纺织产品基本安全技术规范

一、检测样品
样品名称: 纯棉T恤
送检单位: XX跨境电商有限公司

二、检测项目与方法
1. 甲醛含量 - 气相色谱法
2. pH值 - pH计法
3. 色牢度 - 耐洗色牢度试验

三、检测结果
甲醛含量: 75 mg/kg    合格
pH值: 6.8             合格
色牢度: 4-5级          合格

四、检测结论
经检验，该样品所测项目符合GB 18401-2010 B类要求，判定为合格。

备注: 本报告仅对送检样品负责。
`;

/** 从文件名/内容判断报告类型 */
function detectReportType(text: string): ReportType {
  const lower = text.toLowerCase();
  if (/(甲醛|色牢度|纤维|纺织品|织物|布)/.test(text)) return "TEXTILE";
  if (/(电气|接地|泄漏电流|pH|充电|电池|家电|电子)/.test(text)) return "ELECTRONICS";
  if (/(玩具|儿童|EN71|IEC 62115)/.test(text)) return "TOY";
  if (/(食品|接触材料|迁移量|蒸发残渣)/.test(text)) return "FOOD";
  if (/(化妆品|肌肤|香料|防腐剂)/.test(text)) return "COSMETICS";
  if (/(建材|水泥|混凝土|钢材)/.test(text)) return "BUILDING";
  if (/(鞋类|鞋底|耐折|耐磨)/.test(text)) return "FOOTWEAR";
  return "OTHER";
}

/** 提取 GB 标准编号 */
function extractGbStandards(text: string): string[] {
  const re = /GB[\s/]T?\s*\d+(?:\.\d+)?(?:-\d+)?/g;
  return Array.from(new Set((text.match(re) || []).map((s) => s.replace(/\s+/g, ""))));
}

export async function runOcr(_fileBuffer: Buffer, _mimeType: string, fileName: string): Promise<OcrResult> {
  // ===== MOCK 模式（开发环境） =====
  if (process.env.MOCK_OCR === "true") {
    await new Promise((r) => setTimeout(r, 1500)); // 模拟 OCR 耗时
    const text = MOCK_SAMPLE;
    return {
      text,
      pages: 1,
      reportType: detectReportType(text),
      gbStandards: extractGbStandards(text),
      blocks: [{ page: 1, text }],
    };
  }

  // ===== 真实 Google Cloud Vision 调用 =====
  // 此处为生产环境实现。开发期通常使用 MOCK_OCR=true。
  // 生产部署时取消下面的注释并配置 GOOGLE_APPLICATION_CREDENTIALS。
  /*
  const vision = await import("@google-cloud/vision");
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.documentTextDetection({
    image: { content: fileBuffer },
  });
  const fullText = result.fullTextAnnotation?.text || "";
  return {
    text: fullText,
    pages: result.fullTextAnnotation?.pages?.length || 1,
    reportType: detectReportType(fullText),
    gbStandards: extractGbStandards(fullText),
    blocks: [{ page: 1, text: fullText }],
  };
  */
  throw new Error("Real OCR not configured. Set MOCK_OCR=true for development.");
}

/** 从原生 PDF 提取文本（无需 OCR） */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  // ===== MOCK 模式 =====
  if (process.env.MOCK_OCR === "true") {
    return MOCK_SAMPLE;
  }

  // ===== 真实 pdf-parse 调用 =====
  try {
    // pdf-parse 在 ESM 项目中需要动态加载
    const mod = await import("pdf-parse");
    const pdfParse = ((mod as { default?: typeof import("pdf-parse") }).default || mod) as typeof import("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (err) {
    console.error("[PDF Parse Error]", err);
    return "";
  }
}
