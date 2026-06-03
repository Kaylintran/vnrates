"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import { fmtRate } from "@/lib/utils";
import { BANKS } from "@/lib/banks";
import { CURRENCIES } from "@/lib/currencies";
import type { ExchangeRate } from "@/types";

const RATE_CURRENCIES = ["USD", "EUR", "JPY", "KRW", "CNY", "GBP"];

interface RatesSectionProps {
  rates: ExchangeRate[];
}

export default function RatesSection({ rates }: RatesSectionProps) {
  const t = useTranslations("rates");
  const tCur = useTranslations("currencies");
  const [selected, setSelected] = useState("USD");

  const filtered = rates.filter((r) => r.currency === selected);
  const buys = filtered.map((r) => r.buyRate).filter((x): x is number => x !== null);
  const sells = filtered.map((r) => r.sellRate).filter((x): x is number => x !== null);
  const bestBuy = Math.max(...buys);
  const bestSell = Math.min(...sells);

  return (
    <section className="py-16 md:py-32" style={{ backgroundColor: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <FadeIn>
              <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                {t("label")}
              </span>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h2
                className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight"
                style={{ color: "var(--text)" }}
              >
                {t("title1")}{" "}
                <span style={{ color: "var(--green)" }}>{t("title2")}</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="mt-3 text-sm" style={{ color: "var(--text-2)" }}>
                {t("desc")}
              </p>
            </FadeIn>
          </div>

          {/* Currency tabs */}
          <FadeIn delay={0.08}>
            <div className="flex flex-wrap gap-1">
              {RATE_CURRENCIES.map((code) => {
                const info = CURRENCIES.find((c) => c.code === code);
                return (
                  <button
                    key={code}
                    onClick={() => setSelected(code)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
                    style={{
                      color: selected === code ? "var(--text)" : "var(--text-2)",
                      borderColor: selected === code ? "var(--border)" : "transparent",
                      backgroundColor: selected === code ? "var(--surface-2)" : "transparent",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: info?.dot ?? "#888" }}
                    />
                    {code}
                  </button>
                );
              })}
            </div>
          </FadeIn>
        </div>

        {/* Best rate callouts */}
        <FadeIn delay={0.08}>
          <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm">
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "rgba(34,197,94,0.3)", backgroundColor: "rgba(34,197,94,0.06)" }}
            >
              <div className="text-xs mb-1" style={{ color: "var(--text-3)" }}>
                {t("bestBuy")}
              </div>
              <div className="text-xl font-semibold mono" style={{ color: "var(--green)" }}>
                {fmtRate(bestBuy || null)}
              </div>
            </div>
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.06)" }}
            >
              <div className="text-xs mb-1" style={{ color: "var(--text-3)" }}>
                {t("bestSell")}
              </div>
              <div className="text-xl font-semibold mono" style={{ color: "var(--red)" }}>
                {fmtRate(bestSell === Infinity ? null : bestSell)}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Bank cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((rate, i) => {
            const bank = BANKS.find((b) => b.code === rate.bankCode);
            const isBestBuy = rate.buyRate === bestBuy;
            const isBestSell = rate.sellRate === bestSell;
            return (
              <FadeIn key={rate.bankCode} delay={0.05 * (i % 8)}>
                <div
                  className="rounded-xl border p-5 transition-colors"
                  style={{
                    backgroundColor: "var(--bg)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: bank?.color ?? "#888" }}
                    />
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      {rate.bankName}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: "var(--text-3)" }}>
                      {bank?.shortName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs mb-1" style={{ color: "var(--text-3)" }}>
                        {t("colBuy")}
                      </div>
                      <div
                        className="text-base font-semibold mono"
                        style={{ color: isBestBuy ? "var(--green)" : "var(--text)" }}
                      >
                        {fmtRate(rate.buyRate)}
                      </div>
                      {isBestBuy && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--green)" }}
                        >
                          â†‘ {t("bestBuy")}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: "var(--text-3)" }}>
                        {t("colSell")}
                      </div>
                      <div
                        className="text-base font-semibold mono"
                        style={{ color: isBestSell ? "var(--red)" : "var(--text)" }}
                      >
                        {fmtRate(rate.sellRate)}
                      </div>
                      {isBestSell && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--red)" }}
                        >
                          â†“ {t("bestSell")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
