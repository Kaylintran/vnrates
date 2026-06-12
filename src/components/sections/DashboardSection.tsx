"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import { fmtRate } from "@/lib/utils";
import { BANKS } from "@/lib/banks";
import { CURRENCIES } from "@/lib/currencies";
import type { ExchangeRate } from "@/types";

const DASH_CURRENCIES = ["USD", "EUR", "JPY", "KRW", "CNY", "GBP", "AUD", "SGD"];

interface DashboardSectionProps {
  rates: ExchangeRate[];
}

export default function DashboardSection({ rates }: DashboardSectionProps) {
  const t = useTranslations("dashboard");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const filtered = rates.filter((r) => r.currency === selectedCurrency);
  const buys = filtered.map((r) => r.buyRate).filter((x): x is number => x !== null);
  const sells = filtered.map((r) => r.sellRate).filter((x): x is number => x !== null);
  const bestBuy = Math.max(...buys);
  const bestSell = Math.min(...sells);

  return (
    <section className="py-16 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {t("title1")}
            <br />
            <span style={{ color: "var(--green)" }}>{t("title2")}</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mt-3 text-sm max-w-xl" style={{ color: "var(--text-2)" }}>
            {t("desc")}
          </p>
        </FadeIn>

        {/* Currency tabs */}
        <FadeIn delay={0.2}>
          <div className="mt-10 flex flex-wrap gap-1 mb-6">
            {DASH_CURRENCIES.map((code) => {
              const info = CURRENCIES.find((c) => c.code === code);
              return (
                <button
                  key={code}
                  onClick={() => setSelectedCurrency(code)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
                  style={{
                    color: selectedCurrency === code ? "var(--text)" : "var(--text-2)",
                    borderColor: selectedCurrency === code ? "var(--border)" : "transparent",
                    backgroundColor: selectedCurrency === code ? "var(--surface)" : "transparent",
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

        {/* Table */}
        <FadeIn delay={0.24}>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--surface)" }}>
                  <th
                    className="text-left px-6 py-4 text-xs uppercase tracking-wider font-medium"
                    style={{ color: "var(--text-3)" }}
                  >
                    {t("colBank")}
                  </th>
                  <th
                    className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium"
                    style={{ color: "var(--text-3)" }}
                  >
                    Mua
                  </th>
                  <th
                    className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium"
                    style={{ color: "var(--text-3)" }}
                  >
                    Bán
                  </th>
                  <th
                    className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium hidden sm:table-cell"
                    style={{ color: "var(--text-3)" }}
                  >
                    Chuyển
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rate, i) => {
                  const bank = BANKS.find((b) => b.code === rate.bankCode);
                  const isBestBuy = rate.buyRate === bestBuy;
                  const isBestSell = rate.sellRate === bestSell;
                  return (
                    <tr
                      key={rate.bankCode}
                      className="border-t transition-colors"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor:
                          i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: bank?.color ?? "#888" }}
                          />
                          <span style={{ color: "var(--text)" }}>{rate.bankName}</span>
                          <span
                            className="text-xs hidden sm:inline"
                            style={{ color: "var(--text-3)" }}
                          >
                            {bank?.shortName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className="mono"
                          style={{ color: isBestBuy ? "var(--green)" : "var(--text-2)" }}
                        >
                          {fmtRate(rate.buyRate)}
                          {isBestBuy && (
                            <span
                              className="ml-1.5 text-xs px-1.5 py-0.5 rounded"
                              style={{
                                color: "var(--green)",
                                backgroundColor: "rgba(34,197,94,0.12)",
                              }}
                            >
                              {t("best")}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className="mono"
                          style={{ color: isBestSell ? "var(--red)" : "var(--text-2)" }}
                        >
                          {fmtRate(rate.sellRate)}
                          {isBestSell && (
                            <span
                              className="ml-1.5 text-xs px-1.5 py-0.5 rounded"
                              style={{
                                color: "var(--red)",
                                backgroundColor: "rgba(239,68,68,0.12)",
                              }}
                            >
                              {t("best")}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right hidden sm:table-cell">
                        <span className="mono" style={{ color: "var(--text-3)" }}>
                          {fmtRate(rate.transferRate)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
