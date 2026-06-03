"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { fmtRate } from "@/lib/utils";
import { CURRENCIES } from "@/lib/currencies";
import type { ExchangeRate } from "@/types";

const HERO_CURRENCIES = ["USD", "EUR", "JPY", "KRW", "CNY", "GBP"];

interface HeroSectionProps {
  rates: ExchangeRate[];
  date: string;
}

const CHANGE_MOCK: Record<string, number> = {
  USD: 0.12, EUR: -0.08, JPY: -0.31, KRW: 0.05, CNY: 0.02, GBP: 0.19,
};

export default function HeroSection({ rates, date }: HeroSectionProps) {
  const t = useTranslations("hero");
  const tCur = useTranslations("currencies");

  const vcbRates = HERO_CURRENCIES.map((code) => {
    const r = rates.find((x) => x.bankCode === "VCB" && x.currency === code);
    const info = CURRENCIES.find((c) => c.code === code);
    return {
      code,
      dot: info?.dot ?? "#888",
      name: tCur(code as Parameters<typeof tCur>[0]),
      buy: r?.buyRate ?? null,
      sell: r?.sellRate ?? null,
      change: CHANGE_MOCK[code] ?? 0,
    };
  });

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: "easeOut" as const, delay },
  });

  return (
    <section className="relative md:min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(34,197,94,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div {...fade(0)}>
              <span
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border mb-6"
                style={{
                  color: "var(--green)",
                  borderColor: "rgba(34,197,94,0.3)",
                  backgroundColor: "rgba(34,197,94,0.08)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: "var(--green)" }}
                />
                {t("badge")} · {date}
              </span>
            </motion.div>

            <motion.h1 {...fade(0.08)} className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight">
              <span style={{ color: "var(--text)" }}>{t("title1")}</span>
              <br />
              <span style={{ color: "var(--green)" }}>{t("title2")}</span>
            </motion.h1>

            <motion.p
              {...fade(0.16)}
              className="mt-5 text-base leading-relaxed max-w-md"
              style={{ color: "var(--text-2)" }}
            >
              {t("desc")}
            </motion.p>

            <motion.div {...fade(0.24)} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/rates"
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: "var(--green)",
                  color: "#000",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.88")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
                }
              >
                {t("cta1")}
              </Link>
              <Link
                href="/converter"
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium border transition-all duration-200"
                style={{
                  color: "var(--text)",
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--surface)";
                }}
              >
                {t("cta2")}
              </Link>
            </motion.div>
          </div>

          {/* Right — rate widget */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              {/* Widget header */}
              <div
                className="px-5 py-4 border-b flex items-center justify-between"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {t("widgetTitle")} · VCB
                </span>
                <span className="text-xs" style={{ color: "var(--text-3)" }}>
                  {date}
                </span>
              </div>

              {/* Table header */}
              <div
                className="grid grid-cols-4 px-5 py-2 text-xs uppercase tracking-wider"
                style={{ color: "var(--text-3)" }}
              >
                <span className="col-span-2">{t("colCurrency")}</span>
                <span className="text-right">{t("colBuy")}</span>
                <span className="text-right">{t("colSell")}</span>
              </div>

              {/* Rows */}
              {vcbRates.map((item, i) => (
                <div
                  key={item.code}
                  className="grid grid-cols-4 px-5 py-3 border-t items-center"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                  }}
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.dot }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      {item.code}
                    </span>
                    <span
                      className="text-xs hidden sm:inline"
                      style={{ color: "var(--text-3)" }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span
                    className="text-right text-sm mono"
                    style={{ color: "var(--text-2)" }}
                  >
                    {fmtRate(item.buy)}
                  </span>
                  <span
                    className="text-right text-sm mono"
                    style={{ color: "var(--text)" }}
                  >
                    {fmtRate(item.sell)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
