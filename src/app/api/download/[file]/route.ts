// 翻译结果文件下载
// Vercel 环境使用 Blob 存储，本地使用文件系统

import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const isVercel = process.env.VERCEL === "1";

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;

  const ext = file.split(".").pop()?.toLowerCase();
  const mime =
    ext === "pdf" ? "application/pdf" :
    ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
    ext === "html" ? "text/html; charset=utf-8" :
    "application/octet-stream";

  if (isVercel) {
    // Vercel Blob：通过公开 URL 重定向
    return Response.redirect(`${process.env.NEXTAUTH_URL}/api/download/${file}`, 307);
  }

  // 本地文件系统
  const filePath = join(process.cwd(), UPLOAD_DIR, "outputs", file);
  if (!existsSync(filePath)) return new Response("Not found", { status: 404 });

  const buffer = await readFile(filePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file)}"`,
    },
  });
}
