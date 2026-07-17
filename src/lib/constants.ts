// 全局类型定义

export type Result<T> = { success: true; data: T } | { success: false; error: string };

export type Language = {
  code: "TH" | "VI" | "ID" | "MS" | "KM" | "MY" | "LO";
  name: string;
  nameEn: string;
  flag: string;
  country: "THAILAND" | "VIETNAM" | "INDONESIA" | "MALAYSIA" | "CAMBODIA" | "MYANMAR" | "LAOS";
};

export const LANGUAGES: Language[] = [
  { code: "TH", name: "泰语", nameEn: "Thai", flag: "🇹🇭", country: "THAILAND" },
  { code: "VI", name: "越南语", nameEn: "Vietnamese", flag: "🇻🇳", country: "VIETNAM" },
  { code: "ID", name: "印尼语", nameEn: "Indonesian", flag: "🇮🇩", country: "INDONESIA" },
  { code: "MS", name: "马来语", nameEn: "Malay", flag: "🇲🇾", country: "MALAYSIA" },
  { code: "KM", name: "柬埔寨语", nameEn: "Khmer", flag: "🇰🇭", country: "CAMBODIA" },
  { code: "MY", name: "缅甸语", nameEn: "Burmese", flag: "🇲🇲", country: "MYANMAR" },
  { code: "LO", name: "老挝语", nameEn: "Lao", flag: "🇱🇦", country: "LAOS" },
];

export const LANGUAGE_MAP: Record<string, Language> = LANGUAGES.reduce(
  (acc, l) => ({ ...acc, [l.code]: l }),
  {} as Record<string, Language>
);

export type OrderStatus =
  | "PENDING"
  | "OCR_PROCESSING"
  | "TRANSLATING"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "待处理",
  OCR_PROCESSING: "识别中",
  TRANSLATING: "翻译中",
  GENERATING: "生成中",
  COMPLETED: "已完成",
  FAILED: "失败",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  OCR_PROCESSING: "bg-blue-100 text-blue-700",
  TRANSLATING: "bg-blue-100 text-blue-700",
  GENERATING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
};

export type ReportType =
  | "ELECTRONICS"
  | "TEXTILE"
  | "TOY"
  | "FOOD"
  | "COSMETICS"
  | "BUILDING"
  | "FOOTWEAR"
  | "OTHER";

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  ELECTRONICS: "电子电器",
  TEXTILE: "纺织品",
  TOY: "玩具",
  FOOD: "食品接触",
  COSMETICS: "化妆品",
  BUILDING: "建材",
  FOOTWEAR: "鞋类",
  OTHER: "其他",
};
