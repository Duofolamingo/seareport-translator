// 提供上传文件的静态访问
// 注意：生产环境应该用签名 URL + OSS

import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const filePath = join(process.cwd(), UPLOAD_DIR, file);
  if (!existsSync(filePath)) return new Response("Not found", { status: 404 });

  const buffer = await readFile(filePath);
  const ext = file.split(".").pop()?.toLowerCase();
  const mime =
    ext === "pdf" ? "application/pdf" :
    ext === "png" ? "image/png" :
    ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
    "application/octet-stream";

  return new Response(buffer, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
