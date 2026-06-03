import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-var",
  weight: ["400", "500"],
  display: "swap",
});

const titles: Record<string, string> = {
  vi: "Tỷ giá ngoại tệ ngân hàng Việt Nam",
  ko: "베트남 은행 환율",
  "zh-CN": "越南银行外汇汇率",
  "zh-TW": "越南銀行外匯匯率",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      template: "%s | Vnrates",
      default: titles[locale] ?? "Vnrates",
    },
    description:
      "Tỷ giá ngoại tệ từ 10+ ngân hàng Việt Nam. Cập nhật hàng ngày.",
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as (typeof locales)[number])) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${mono.variable}`}>
      <head />
      <body
        className="min-h-screen flex flex-col overflow-x-hidden"
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
          fontFamily: "var(--font-inter), -apple-system, sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
