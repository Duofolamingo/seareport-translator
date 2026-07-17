// 文件上传
// 限制：PDF / JPG / PNG，最大 50MB
// 保存到 ./uploads/ 目录

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { nanoid } from "nanoid";
import { getCurrentUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || "52428800"); // 50MB
const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/jpg", "image/png"]);

export async function POST(req: Request) {
  try {
    // 可选：要求登录（也可匿名上传，但后续翻译时需登录）
    // const user = await getCurrentUser();

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return fail("未提供文件", 400, "NO_FILE");
    if (file.size > MAX_SIZE) return fail(`文件超过限制 (${Math.round(MAX_SIZE / 1024 / 1024)}MB)`, 400, "TOO_LARGE");
    if (!ALLOWED.has(file.type)) return fail("仅支持 PDF / JPG / PNG", 400, "UNSUPPORTED_TYPE");

    const dir = join(process.cwd(), UPLOAD_DIR);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });

    const ext = file.name.split(".").pop() || "pdf";
    const fileName = `${nanoid(16)}-${Date.now()}.${ext}`;
    const filePath = join(dir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return ok({
      fileName: file.name,
      savedName: fileName,
      fileUrl: `/api/upload/${fileName}`,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (err) {
    return handleError(err);
  }
}
