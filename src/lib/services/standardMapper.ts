// 标准映射服务
// 1. 从 OCR 文本中提取 GB 标准编号
// 2. 查询 StandardMapping 表获取目标国标准
// 3. 生成标准对照附页

import { prisma } from "@/lib/prisma";
import type { Country, ReportType } from "@prisma/client";

export type StandardMatch = {
  gbStandard: string;
  gbName: string;
  targetCountry: Country;
  targetStandard: string;
  targetName: string;
  productCategory: ReportType;
  notes: string | null;
};

/** 提取 GB 标准编号 */
export function extractGbStandards(text: string): string[] {
  const re = /GB[\s/]T?\s*\d+(?:\.\d+)?(?:-\d+)?/g;
  return Array.from(new Set((text.match(re) || []).map((s) => s.replace(/\s+/g, ""))));
}

/** 查询目标国对应的标准 */
export async function findStandardMappings(
  gbStandards: string[],
  targetCountry: Country,
  productCategory?: ReportType
): Promise<StandardMatch[]> {
  if (gbStandards.length === 0) return [];
  try {
    const rows = await prisma.standardMapping.findMany({
      where: {
        gbStandard: { in: gbStandards },
        targetCountry,
        ...(productCategory ? { productCategory } : {}),
      },
    });
    return rows.map((r) => ({
      gbStandard: r.gbStandard,
      gbName: r.gbName,
      targetCountry: r.targetCountry,
      targetStandard: r.targetStandard,
      targetName: r.targetName,
      productCategory: r.productCategory,
      notes: r.notes,
    }));
  } catch {
    return [];
  }
}

/** 生成标准对照附页（HTML 字符串） */
export function generateStandardSheetHtml(
  matches: StandardMatch[],
  targetCountryLabel: string,
  targetLangLabel: string
): string {
  if (matches.length === 0) {
    return `
      <div class="standard-sheet">
        <h2>标准对照说明 / ${targetLangLabel} Translation Standard Reference</h2>
        <p class="note">本报告中未识别到对应的 GB 国家标准，未生成标准对照表。</p>
        <p class="note">No matching GB national standards were identified; no comparison sheet was generated.</p>
      </div>`;
  }

  const rows = matches
    .map(
      (m) => `
      <tr>
        <td><strong>${escapeHtml(m.gbStandard)}</strong></td>
        <td>${escapeHtml(m.gbName)}</td>
        <td>${escapeHtml(m.targetStandard)}</td>
        <td>${escapeHtml(m.targetName)}</td>
        <td>${escapeHtml(m.productCategory)}</td>
        <td>${escapeHtml(m.notes || "-")}</td>
      </tr>`
    )
    .join("");

  return `
    <div class="standard-sheet">
      <h2>标准对照说明 / Standard Comparison Sheet (${targetCountryLabel})</h2>
      <p class="intro">
        本报告识别到以下中国 GB 标准，并已自动匹配 ${targetCountryLabel}（${targetLangLabel}）的对应标准，
        供当地监管部门、客户和合作方参考。
      </p>
      <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead style="background:#f1f5f9;">
          <tr>
            <th>GB 标准</th>
            <th>GB 标准名称</th>
            <th>${targetCountryLabel} 标准</th>
            <th>${targetCountryLabel} 标准名称</th>
            <th>品类</th>
            <th>差异说明</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="disclaimer">
        * 本对照表仅供参考。具体合规要求请以目标国最新法规和官方公告为准。
      </p>
    </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const COUNTRY_LABEL: Record<Country, string> = {
  THAILAND: "泰国",
  VIETNAM: "越南",
  INDONESIA: "印度尼西亚",
  MALAYSIA: "马来西亚",
  PHILIPPINES: "菲律宾",
  CAMBODIA: "柬埔寨",
  MYANMAR: "缅甸",
  LAOS: "老挝",
};

export const COUNTRY_LABEL_EN: Record<Country, string> = {
  THAILAND: "Thailand",
  VIETNAM: "Vietnam",
  INDONESIA: "Indonesia",
  MALAYSIA: "Malaysia",
  PHILIPPINES: "Philippines",
  CAMBODIA: "Cambodia",
  MYANMAR: "Myanmar",
  LAOS: "Laos",
};
