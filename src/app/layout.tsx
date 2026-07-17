import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Sans_Thai, Noto_Sans_Khmer, Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const notoSans = Noto_Sans_SC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-thai",
});

const notoKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-khmer",
});

const notoMyanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-myanmar",
});

export const metadata: Metadata = {
  title: "SeaReport Translator - 一键翻译质检报告，轻松出海东南亚",
  description:
    "面向跨境电商卖家的东南亚质检报告 AI 翻译平台。5 分钟将中文质检报告翻译为泰语、越南语、印尼语、马来语等 7 种东南亚语言，并自动生成 GB 标准对照表。",
  keywords: ["质检报告翻译", "东南亚翻译", "GB标准", "跨境电商", "TIS标准", "SNI标准"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSans.variable} ${notoThai.variable} ${notoKhmer.variable} ${notoMyanmar.variable}`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
