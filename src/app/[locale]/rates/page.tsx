"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { fmtRate } from "@/lib/utils";
import { BANKS } from "@/lib/banks";
import { CURRENCIES } from "@/lib/currencies";
import FadeIn from "@/components/ui/FadeIn";
import CTASection from "@/components/sections/CTASection";
import HistoryChart from "@/components/rates/HistoryChart";
import type { ExchangeRate } from "@/types";

const ALL_CURRENCIES = CURRENCIES.map((c) => c.code);
const todayStr = new Date().toISOString().split("T")[0];
const minDateStr = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().split("T")[0];
})();

type ViewMode = "currency" | "bank" | "history";

export default function RatesPage() {
  const t = useTranslations("rates");
  const tCur = useTranslations("currencies");
  const locale = useLocale();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("currency");
  const [selected, setSelected] = useState("USD");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    if (view === "history") return;
    setLoading(true);
    fetch(`/api/rates?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => { setRates(d.rates ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedDate, view]);

  function switchView(mode: ViewMode) {
    setView(mode);
    if (mode === "bank") setSelected("VCB");
    else setSelected("USD");
  }

  const filtered =
    view === "currency"
      ? rates.filter((r) => r.currency === selected)
      : rates.filter((r) => r.bankCode === selected);

  const buys = filtered.map((r) => r.buyRate).filter((x): x is number => x !== null);
  const sells = filtered.map((r) => r.sellRate).filter((x): x is number => x !== null);
  const bestBuy = buys.length ? Math.max(...buys) : null;
  const bestSell = sells.length ? Math.min(...sells) : null;

  const dateLabel = selectedDate === todayStr
    ? t("today")
    : new Date(selectedDate + "T00:00:00").toLocaleDateString(locale === "vi" ? "vi-VN" : locale);

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Page header */}
      <section className="pt-16 pb-12 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
              {t("label")}
            </span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              {t("title1")} <span style={{ color: "var(--green)" }}>{t("title2")}</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-3 text-sm max-w-xl" style={{ color: "var(--text-2)" }}>{t("desc")}</p>
          </FadeIn>

          {/* View toggle */}
          <FadeIn delay={0.2}>
            <div className="mt-8 flex gap-1 flex-wrap">
              {(["currency", "bank", "history"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => switchView(mode)}
                  className="px-4 py-2 text-sm rounded-lg border transition-all"
                  style={{
                    color: view === mode ? "var(--text)" : "var(--text-2)",
                    borderColor: view === mode ? "var(--green)" : "var(--border)",
                    backgroundColor: view === mode ? "rgba(34,197,94,0.08)" : "transparent",
                  }}
                >
                  {mode === "currency" ? t("tabCurrency") : mode === "bank" ? t("tabBank") : t("tabHistory")}
                </button>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Selector tabs */}
      <section className="border-b sticky top-[104px] z-30" style={{ borderColor: "var(--border)", backgroundColor: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {(view === "currency" || view === "history"
              ? ALL_CURRENCIES
              : BANKS.map((b) => b.code)
            ).map((code) => {
              const info = view === "bank" ? BANKS.find((b) => b.code === code) : CURRENCIES.find((c) => c.code === code);
              const dot = view === "bank" ? (info as typeof BANKS[0])?.color : (info as typeof CURRENCIES[0])?.dot;
              return (
                <button
                  key={code}
                  onClick={() => setSelected(code)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all"
                  style={{
                    color: selected === code ? "var(--text)" : "var(--text-2)",
                    borderColor: selected === code ? "var(--border)" : "transparent",
                    backgroundColor: selected === code ? "var(--surface)" : "transparent",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot ?? "#888" }} />
                  {code}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Summary bar — hidden in history view */}
      {view !== "history" && (
        <section className="py-6 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-6 items-center">
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-3)" }}>{t("bestBuy")}</div>
              <div className="text-2xl font-semibold mono" style={{ color: "var(--green)" }}>
                {loading ? "—" : fmtRate(bestBuy)}
              </div>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: "var(--border)" }} />
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-3)" }}>{t("bestSell")}</div>
              <div className="text-2xl font-semibold mono" style={{ color: "var(--red)" }}>
                {loading ? "—" : fmtRate(bestSell)}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs hidden sm:inline" style={{ color: "var(--text-3)" }}>{dateLabel}</span>
              <input
                type="date"
                value={selectedDate}
                max={todayStr}
                min={minDateStr}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="text-xs rounded-lg border px-3 py-1.5 bg-transparent cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--text-2)", colorScheme: "dark" }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Main content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {view === "history" ? (
            <HistoryChart currency={selected} />
          ) : loading ? (
            <div className="py-24 text-center text-sm" style={{ color: "var(--text-3)" }}>
              {t("loading")}
            </div>
          ) : (
            <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: "var(--border)" }}>
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr style={{ backgroundColor: "var(--surface)" }}>
                    <th className="text-left px-6 py-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-3)" }}>
                      {view === "currency" ? t("colBank") : t("colCurrencyLabel")}
                    </th>
                    <th className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-3)" }}>{t("colBuy")}</th>
                    <th className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-3)" }}>{t("colSell")}</th>
                    <th className="text-right px-6 py-4 text-xs uppercase tracking-wider font-medium hidden md:table-cell" style={{ color: "var(--text-3)" }}>{t("colTransfer")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rate, i) => {
                    const bank = BANKS.find((b) => b.code === rate.bankCode);
                    const cur = CURRENCIES.find((c) => c.code === rate.currency);
                    const isBestBuy = rate.buyRate === bestBuy;
                    const isBestSell = rate.sellRate === bestSell;
                    const label = view === "currency" ? rate.bankName : rate.currency;
                    const dot = view === "currency" ? bank?.color : cur?.dot;
                    const sub = view === "currency" ? bank?.shortName : tCur(rate.currency as Parameters<typeof tCur>[0]);
                    return (
                      <tr
                        key={view === "currency" ? rate.bankCode : rate.currency}
                        className="border-t"
                        style={{ borderColor: "var(--border)", backgroundColor: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent" }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot ?? "#888" }} />
                            <span style={{ color: "var(--text)" }}>{label}</span>
                            <span className="text-xs hidden sm:inline" style={{ color: "var(--text-3)" }}>{sub}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="mono" style={{ color: isBestBuy ? "var(--green)" : "var(--text-2)" }}>
                            {fmtRate(rate.buyRate)}
                            {isBestBuy && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded" style={{ color: "var(--green)", backgroundColor: "rgba(34,197,94,0.12)" }}>{t("best")}</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="mono" style={{ color: isBestSell ? "var(--red)" : "var(--text-2)" }}>
                            {fmtRate(rate.sellRate)}
                            {isBestSell && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded" style={{ color: "var(--red)", backgroundColor: "rgba(239,68,68,0.12)" }}>{t("best")}</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden md:table-cell">
                          <span className="mono" style={{ color: "var(--text-3)" }}>{fmtRate(rate.transferRate)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </div>
  );
}
