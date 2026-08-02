import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Font Lab",
  description: "本机字体实时预览工具",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
