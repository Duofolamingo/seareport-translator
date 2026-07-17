// 翻译服务 - 封装 DeepSeek API
// 支持术语库预处理/后处理，保证行业一致性

import { prisma } from "@/lib/prisma";
import type { Term } from "@prisma/client";

export type TargetLang = "TH" | "VI" | "ID" | "MS" | "KM" | "MY" | "LO";

export const LANG_CODE_MAP: Record<TargetLang, string> = {
  TH: "th",
  VI: "vi",
  ID: "id",
  MS: "ms",
  KM: "km",
  MY: "my",
  LO: "lo",
};

const LANG_NAME_MAP: Record<TargetLang, string> = {
  TH: "Thai",
  VI: "Vietnamese",
  ID: "Indonesian",
  MS: "Malay",
  KM: "Khmer",
  MY: "Burmese",
  LO: "Lao",
};

const LANG_FIELD_MAP: Record<TargetLang, keyof Term> = {
  TH: "thai",
  VI: "vietnamese",
  ID: "indonesian",
  MS: "malay",
  KM: "khmer",
  MY: "burmese",
  LO: "lao",
};

export async function loadTerms(): Promise<Term[]> {
  try {
    return await prisma.term.findMany();
  } catch {
    return [];
  }
}

export function protectTerms(text: string, terms: Term[]): { protected: string; restoreMap: Map<string, string> } {
  const restoreMap = new Map<string, string>();
  let protectedText = text;
  let i = 0;
  for (const t of terms) {
    if (!t.chinese) continue;
    if (!protectedText.includes(t.chinese)) continue;
    const placeholder = `__TERM_${i++}__`;
    restoreMap.set(placeholder, t.chinese);
    protectedText = protectedText.split(t.chinese).join(placeholder);
  }
  return { protected: protectedText, restoreMap };
}

export function restoreTerms(text: string, restoreMap: Map<string, string>, terms: Term[], target: TargetLang): string {
  const field = LANG_FIELD_MAP[target];
  let result = text;
  for (const [placeholder, chinese] of restoreMap.entries()) {
    const term = terms.find((t) => t.chinese === chinese);
    const translation = term?.[field] as string | null | undefined;
    result = result.split(placeholder).join(translation || chinese);
  }
  return result;
}

export async function translateText(text: string, target: TargetLang): Promise<string> {
  if (!text.trim()) return text;

  const terms = await loadTerms();
  const { protected: protectedText, restoreMap } = protectTerms(text, terms);

  let translated: string;

  if (process.env.MOCK_TRANSLATION === "true") {
    translated = await mockTranslate(protectedText, target);
  } else {
    translated = await deepseekTranslate(protectedText, target);
  }

  return restoreTerms(translated, restoreMap, terms, target);
}

async function deepseekTranslate(text: string, target: TargetLang): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

  if (!apiKey) {
    throw new Error("DeepSeek API key not configured");
  }

  const targetLangName = LANG_NAME_MAP[target];
  const targetLangCode = LANG_CODE_MAP[target];

  const prompt = `你是一个专业的质检报告翻译助手。请将以下中文质检报告内容翻译成${targetLangName}(${targetLangCode})。

要求：
1. 保留所有标准编号（如 GB 18401-2010）和技术指标（如 75 mg/kg、6.8、4-5级）
2. 保留表格结构和编号格式
3. 专业术语翻译准确
4. 保持正式、专业的语气
5. 不要添加额外解释或翻译之外的内容

待翻译文本：
${text}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个专业的翻译助手，精通质检报告翻译。" },
          { role: "user", content: prompt },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("DeepSeek API returned empty response");
    }

    return content.trim();
  } catch (err) {
    console.error("[DeepSeek Translate Error]", err);
    if (err instanceof Error && err.message.includes("401")) {
      throw new Error("API Key无效，请检查配置");
    }
    throw err;
  }
}

async function mockTranslate(text: string, target: TargetLang): Promise<string> {
  await new Promise((r) => setTimeout(r, 500));
  return `[${LANG_CODE_MAP[target].toUpperCase()}] ${text}`;
}

export function detectReportType(text: string): "ELECTRONICS" | "TEXTILE" | "TOY" | "FOOD" | "COSMETICS" | "BUILDING" | "FOOTWEAR" | "OTHER" {
  if (/(甲醛|色牢度|纤维|纺织品|织物|布)/.test(text)) return "TEXTILE";
  if (/(电气|接地|泄漏电流|家电|电子)/.test(text)) return "ELECTRONICS";
  if (/(玩具|儿童)/.test(text)) return "TOY";
  if (/(食品|接触材料)/.test(text)) return "FOOD";
  if (/(化妆品)/.test(text)) return "COSMETICS";
  if (/(建材|水泥|混凝土)/.test(text)) return "BUILDING";
  if (/(鞋类|鞋底)/.test(text)) return "FOOTWEAR";
  return "OTHER";
}