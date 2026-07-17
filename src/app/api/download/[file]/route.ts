// 翻译结果文件下载

import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const filePath = join(process.cwd(), UPLOAD_DIR, "outputs", file);
  if (!existsSync(filePath)) return new Response("Not found", { status: 404 });

  const buffer = await readFile(filePath);
  const ext = file.split(".").pop()?.toLowerCase();
  const mime =
    ext === "pdf" ? "application/pdf" :
    ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
    ext === "html" ? "text/html; charset=utf-8" :
    "application/octet-stream";

  return new Response(buffer, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file)}"`,
    },
  });
}
