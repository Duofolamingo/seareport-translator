// PDF 生成服务
// 使用 puppeteer-core + 系统浏览器（优先查找已安装的 Chrome）

import { saveFile } from "./storage";
import { existsSync } from "fs";

async function findChromePath(): Promise<string | null> {
  const paths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Chromium\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];

  for (const path of paths) {
    if (existsSync(path)) return path;
  }
  return null;
}

export async function generatePdf(html: string): Promise<Buffer> {
  let puppeteer: any;
  let browser: any;

  try {
    puppeteer = await loadPuppeteer();
    if (!puppeteer) {
      throw new Error("Puppeteer not available");
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      printBackground: true,
    });

    const pdfBuffer = Buffer.from(pdf);
    const isValidPdf = pdfBuffer.toString("utf-8", 0, 4) === "%PDF";
    if (!isValidPdf) {
      throw new Error("Generated content is not a valid PDF");
    }

    return pdfBuffer;
  } catch (err) {
    console.warn("[PDF] Puppeteer error:", (err as Error).message);
    throw new Error(`PDF generation failed: ${(err as Error).message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.warn("[PDF] Error closing browser:", e);
      }
    }
  }
}

async function loadPuppeteer(): Promise<any | null> {
  try {
    const mod = await import("puppeteer");
    return (mod as any).default || mod;
  } catch {
    try {
      const mod = await import("puppeteer-core");
      return (mod as any).default || mod;
    } catch {
      return null;
    }
  }
}

export async function savePdf(buffer: Buffer, fileName: string): Promise<string> {
  const actualFileName = fileName.replace(/\.pdf$/, "") + ".pdf";
  const { url } = await saveFile(`outputs/${actualFileName}`, buffer, { contentType: "application/pdf" });
  return url;
}

export async function generateImage(html: string, format: "png" | "jpeg" = "png"): Promise<Buffer> {
  let browser: any;

  try {
    const puppeteer = await loadPuppeteer();
    if (!puppeteer) {
      throw new Error("Puppeteer not available");
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });

    const body = await page.$("body");
    if (!body) {
      throw new Error("Body element not found");
    }

    const clip = await body.boundingBox();
    if (!clip) {
      throw new Error("Bounding box not found");
    }

    const screenshot = await page.screenshot({
      type: format,
      clip: {
        x: clip.x,
        y: clip.y,
        width: Math.min(clip.width, 1920),
        height: clip.height,
      },
      printBackground: true,
      quality: 100,
    });

    const imgBuffer = Buffer.from(screenshot);
    const isValidImage = (format === "png" && imgBuffer.toString("hex", 0, 8) === "89504e470d0a1a0a") ||
                         (format === "jpeg" && imgBuffer.toString("hex", 0, 4) === "ffd8ffe0");
    if (!isValidImage) {
      throw new Error(`Generated content is not a valid ${format.toUpperCase()} image`);
    }

    return imgBuffer;
  } catch (err) {
    console.warn("[Image] Puppeteer error:", (err as Error).message);
    throw new Error(`Image generation failed: ${(err as Error).message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.warn("[Image] Error closing browser:", e);
      }
    }
  }
}

export async function saveImage(buffer: Buffer, fileName: string, format: "png" | "jpeg"): Promise<string> {
  const ext = format === "png" ? "png" : "jpg";
  const actualFileName = fileName.replace(/\.(pdf|docx)$/, "") + `.${ext}`;
  const contentType = format === "png" ? "image/png" : "image/jpeg";
  const { url } = await saveFile(`outputs/${actualFileName}`, buffer, { contentType });
  return url;
}