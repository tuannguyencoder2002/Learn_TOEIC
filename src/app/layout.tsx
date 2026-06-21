import type { Metadata, Viewport } from "next";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn TOEIC - Part 5 Practice",
  description: "Ôn luyện TOEIC Part 5 với OpenAI - dạng từ, ngữ pháp, từ vựng",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-brand antialiased">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-3 py-4 pb-mobile-nav sm:px-4 sm:py-6 md:py-8 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
