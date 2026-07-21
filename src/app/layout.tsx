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
  title: "AI 赋能跨境电商:产品计量认证国际互认应用",
  description:
    "AI 赋能跨境电商产品计量认证国际互认应用平台，助力企业跨境贸易合规高效。提供质检报告翻译、标准对照等服务。",
  keywords: ["跨境电商", "产品认证", "计量认证", "国际互认", "质检报告翻译", "GB标准"],
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
