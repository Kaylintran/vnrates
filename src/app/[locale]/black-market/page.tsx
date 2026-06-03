"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, TrendingUp } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { fmtRate } from "@/lib/utils";
import { CURRENCIES } from "@/lib/currencies";
import CTASection from "@/components/sections/CTASection";
import BlackMarketHistoryChart from "@/components/rates/BlackMarketHistoryChart";
import type { BMRate } from "@/lib/blackMarketConfig";

type ViewMode = "table" | "history";

export default function BlackMarketPage() {
  const t = useTranslations("blackMarket");
  const tc = useTranslations("currencies");
  const [view, setView] = useState<ViewMode>("table");
  const [bmRates, setBmRates] = useState<BMRate[]>([]);

  useEffect(() => {
    fetch("/api/black-market")
      .then((r) => r.json())
      .then((d) => setBmRates(d.rates ?? []));
  }, []);

  const diffPct = (bm: number | null, bank: number | null | undefined) => {
    if (!bm || !bank) return null;
    return (((bm - bank) / bank) * 100).toFixed(2);
  };

  const usd = bmRates.find((r) => r.currency === "USD");

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <section className="pt-16 pb-12 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
              {t("label")}
            </span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              {t("title1")} <span style={{ color: "var(--gold)" }}>{t("title2")}</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-3 text-sm max-w-xl" style={{ color: "var(--text-2)" }}>
              {t("desc")}
            </p>
          </FadeIn>

          {/* View toggle */}
          <FadeIn delay={0.2}>
            <div className="mt-8 flex gap-1">
              {(["table", "history"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  className="px-4 py-2 text-sm rounded-lg border transition-all"
                  style={{
                    color: view === mode ? "var(--text)" : "var(--text-2)",
                    borderColor: view === mode ? "var(--gold)" : "var(--border)",
                    backgroundColor: view === mode ? "rgba(245,158,11,0.08)" : "transparent",
                  }}
                >
                  {mode === "table" ? t("tabRates") : t("tabHistory")}
                </button>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {view === "history" ? (
        /* History chart view */
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BlackMarketHistoryChart />
          </div>
        </section>
      ) : (
        <>
          {/* Warning banner */}
          <div className="border-b" style={{ borderColor: "rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.05)" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-3 items-start">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: "var(--red)" }} />
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{t("warning")}</p>
            </div>
          </div>

          {/* Summary stats */}
          <section className="py-8 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: t("statUsdBuy"),  value: fmtRate(usd?.buy),  color: "var(--gold)" },
                  { label: t("statUsdSell"), value: fmtRate(usd?.sell), color: "var(--text)" },
                  {
                    label: t("statDiffBuy"),
                    value: usd?.buy != null && usd?.vcbBuy != null
                      ? `+${fmtRate(usd.buy - usd.vcbBuy)}`
                      : "—",
                    color: "var(--gold)",
                  },
                  {
                    label: t("statDiffSell"),
                    value: usd?.sell != null && usd?.vcbSell != null
                      ? `+${fmtRate(usd.sell - usd.vcbSell)}`
                      : "—",
                    color: "var(--gold)",
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-xs mb-1" style={{ color: "var(--text-3)" }}>{stat.label}</div>
                    <div className="text-2xl font-semibold mono" style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Main comparison table */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <FadeIn>
                <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--text)" }}>
                  {t("compareTitle")}
                </h2>
              </FadeIn>
              <FadeIn delay={0.08}>
                <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: "var(--border)" }}>
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr style={{ backgroundColor: "var(--surface)" }}>
                        <th className="text-left px-6 py-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-3)" }}>{t("colCurrency")}</th>
                        <th className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--gold)" }}>{t("colBMBuy")}</th>
                        <th className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-3)" }}>{t("colBMSell")}</th>
                        <th className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--green)" }}>{t("colVCBBuy")}</th>
                        <th className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-3)" }}>{t("colVCBSell")}</th>
                        <th className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium hidden md:table-cell" style={{ color: "var(--text-3)" }}>{t("colDiffPct")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bmRates.map((bm, i) => {
                        const info = CURRENCIES.find((c) => c.code === bm.currency);
                        const pct = diffPct(bm.sell, bm.vcbSell);
                        const currencyName = tc(bm.currency as Parameters<typeof tc>[0]);
                        return (
                          <tr key={bm.currency} className="border-t" style={{ borderColor: "var(--border)", backgroundColor: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info?.dot ?? "#888" }} />
                                <span className="font-medium" style={{ color: "var(--text)" }}>{bm.currency}</span>
                                <span className="text-xs" style={{ color: "var(--text-3)" }}>{currencyName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right mono font-medium" style={{ color: "var(--gold)" }}>{fmtRate(bm.buy)}</td>
                            <td className="px-6 py-4 text-right mono" style={{ color: "var(--text-2)" }}>{fmtRate(bm.sell)}</td>
                            <td className="px-6 py-4 text-right mono" style={{ color: "var(--green)" }}>{fmtRate(bm.vcbBuy)}</td>
                            <td className="px-6 py-4 text-right mono" style={{ color: "var(--text-2)" }}>{fmtRate(bm.vcbSell)}</td>
                            <td className="px-6 py-4 text-right hidden md:table-cell">
                              {pct && (
                                <span className="flex items-center justify-end gap-1 text-xs" style={{ color: "var(--gold)" }}>
                                  <TrendingUp size={12} />
                                  +{pct}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </FadeIn>

              {/* Info cards */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FadeIn delay={0.12}>
                  <div className="rounded-xl border p-5" style={{ borderColor: "rgba(245,158,11,0.2)", backgroundColor: "rgba(245,158,11,0.06)" }}>
                    <div className="text-sm font-medium mb-2" style={{ color: "var(--gold)" }}>{t("whyTitle")}</div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{t("whyDesc")}</p>
                  </div>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <div className="rounded-xl border p-5" style={{ borderColor: "rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.06)" }}>
                    <div className="text-sm font-medium mb-2" style={{ color: "var(--red)" }}>{t("legalTitle")}</div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{t("legalDesc")}</p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>
        </>
      )}

      <CTASection />
    </div>
  );
}
