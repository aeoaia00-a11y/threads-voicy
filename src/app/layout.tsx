import type { Metadata } from "next";
import { MainLayout } from "@/components/layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threads Voicy - 投稿作成ツール",
  description: "Threads投稿を効率的に作成・管理するツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
