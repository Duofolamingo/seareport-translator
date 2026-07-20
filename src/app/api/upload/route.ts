// 文件上传
// 限制：PDF / JPG / PNG，最大 50MB
// Vercel 环境使用 Blob 存储，本地使用文件系统

import { nanoid } from "nanoid";
import { getCurrentUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { saveFile } from "@/lib/services/storage";

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

    const ext = file.name.split(".").pop() || "pdf";
    const fileName = `${nanoid(16)}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { url } = await saveFile(fileName, buffer, { contentType: file.type });

    return ok({
      fileName: file.name,
      savedName: fileName,
      fileUrl: url,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (err) {
    return handleError(err);
  }
}
