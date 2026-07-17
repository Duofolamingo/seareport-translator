// 通用工具函数

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 Tailwind class */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 格式化字节 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

/** 格式化日期 */
export function formatDate(date: Date | string | null | undefined, fmt = "yyyy-MM-dd HH:mm"): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return fmt
    .replace("yyyy", d.getFullYear().toString())
    .replace("MM", pad(d.getMonth() + 1))
    .replace("dd", pad(d.getDate()))
    .replace("HH", pad(d.getHours()))
    .replace("mm", pad(d.getMinutes()))
    .replace("ss", pad(d.getSeconds()));
}

/** 延迟 */
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** 截断文本 */
export function truncate(text: string, n = 100): string {
  if (!text) return "";
  return text.length > n ? text.slice(0, n) + "..." : text;
}

/** 简单数字 ID */
export function shortId(len = 8): string {
  return Math.random().toString(36).slice(2, 2 + len);
}
