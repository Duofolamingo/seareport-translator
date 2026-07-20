// 统一存储服务
// Vercel 环境使用 Blob 存储（只读文件系统）
// 本地环境使用文件系统

import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { put, del } from "@vercel/blob";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const isVercel = process.env.VERCEL === "1";

function getLocalPath(path: string): string {
  return join(process.cwd(), UPLOAD_DIR, path);
}

export async function saveFile(
  path: string,
  buffer: Buffer,
  options?: { contentType?: string }
): Promise<{ url: string; pathname: string }> {
  if (isVercel) {
    const blob = await put(path, buffer, {
      access: "public",
      contentType: options?.contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url, pathname: path };
  }

  // 本地文件系统
  const localPath = getLocalPath(path);
  const dir = localPath.substring(0, localPath.lastIndexOf("\\") + 1).replace(/\\$/, "");
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(localPath, buffer);
  return { url: `/api/upload/${path.replace(/\\/g, "/")}`, pathname: path };
}

export async function readFileBuffer(path: string): Promise<Buffer> {
  if (isVercel) {
    // Vercel Blob 使用公开 URL 读取
    const url = path.startsWith("http") ? path : `${process.env.NEXTAUTH_URL}/api/upload/${path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }

  const localPath = getLocalPath(path);
  return readFile(localPath);
}

export async function deleteFile(path: string): Promise<void> {
  if (isVercel) {
    // Vercel Blob 暂不支持通过 pathname 删除，需要保存 blob url
    // 这里仅做日志记录
    console.log("[Storage] Vercel blob delete not implemented for", path);
    return;
  }

  const localPath = getLocalPath(path);
  if (existsSync(localPath)) {
    const { unlink } = await import("fs/promises");
    await unlink(localPath);
  }
}

export function getFileUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (isVercel) {
    return `${process.env.NEXTAUTH_URL}/api/upload/${path.replace(/\\/g, "/")}`;
  }
  return `/api/upload/${path.replace(/\\/g, "/")}`;
}
