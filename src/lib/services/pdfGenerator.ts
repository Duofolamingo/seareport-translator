// PDF 生成服务
// 使用 puppeteer-core + 系统浏览器（优先查找已安装的 Chrome）

import { saveFile } from "./storage";

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
  try {
    const chromePath = await findChromePath();
    if (!chromePath) {
      console.warn("[PDF] Chrome/Chromium not found, returning HTML");
      return Buffer.from(html, "utf-8");
    }

    const puppeteer = await loadPuppeteerCore();
    if (!puppeteer) {
      console.warn("[PDF] puppeteer-core not available, returning HTML");
      return Buffer.from(html, "utf-8");
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chromePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
      const pdf = await page.pdf({
        format: "A4",
        margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
        printBackground: true,
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.warn("[PDF] Puppeteer error, returning HTML:", (err as Error).message);
    return Buffer.from(html, "utf-8");
  }
}

async function loadPuppeteerCore(): Promise<any | null> {
  try {
    const mod = await import("puppeteer-core");
    return (mod as any).default || mod;
  } catch {
    return null;
  }
}

export async function savePdf(buffer: Buffer, fileName: string): Promise<string> {
  const actualFileName = fileName.replace(/\.pdf$/, "") + ".pdf";
  const { url } = await saveFile(`outputs/${actualFileName}`, buffer, { contentType: "application/pdf" });
  return url;
}