import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "旅行規劃筆記",
  description: "個人旅行規劃工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
