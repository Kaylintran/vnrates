"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { CURRENCIES } from "@/lib/currencies";
import { BANKS } from "@/lib/banks";
import { fmtRate } from "@/lib/utils";
import type { ExchangeRate } from "@/types";

const ALL_CURRENCIES = [
  { code: "VND", label: "VND — Đồng Việt Nam" },
  ...CURRENCIES.map((c) => ({ code: c.code, label: `${c.code} — ${c.nameVi}` })),
];

function getVcbRate(rates: ExchangeRate[], currency: string, side: "buy" | "sell"): number | null {
  const r = rates.find((x) => x.bankCode === "VCB" && x.currency === currency);
  return side === "buy" ? (r?.buyRate ?? null) : (r?.sellRate ?? null);
}

function convertAmount(amount: number, from: string, to: string, rates: ExchangeRate[]) {
  if (!amount || isNaN(amount)) return { buy: null, sell: null };
  if (from === to) return { buy: amount, sell: amount };
  if (to === "VND") {
    const buy = getVcbRate(rates, from, "buy");
    const sell = getVcbRate(rates, from, "sell");
    return { buy: buy ? amount * buy : null, sell: sell ? amount * sell : null };
  }
  if (from === "VND") {
    const toSell = getVcbRate(rates, to, "sell");
    return { buy: toSell ? amount / toSell : null, sell: null };
  }
  const fromSell = getVcbRate(rates, from, "sell");
  const toSell = getVcbRate(rates, to, "sell");
  if (!fromSell || !toSell) return { buy: null, sell: null };
  return { buy: (amount * fromSell) / toSell, sell: null };
}

function fmt(n: number | null, to: string): string {
  if (n === null) return "—";
  if (to === "VND" || n > 1000) return Math.round(n).toLocaleString("en-US");
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export default function ConverterPage() {
  const t = useTranslations("converter");
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [amount, setAmount] = useState("1000000");
  const [from, setFrom] = useState("VND");
  const [to, setTo] = useState("USD");

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((d) => setRates(d.rates ?? []));
  }, []);

  const swap = useCallback(() => { setFrom(to); setTo(from); }, [from, to]);
  const parsed = parseFloat(amount.replace(/,/g, ""));
  const result = convertAmount(parsed, from, to, rates);

  const QUICK_PAIRS = [
    { from: "VND", to: "USD", amount: 1000000 },
    { from: "VND", to: "EUR", amount: 1000000 },
    { from: "USD", to: "VND", amount: 100 },
    { from: "EUR", to: "VND", amount: 100 },
    { from: "JPY", to: "VND", amount: 10000 },
    { from: "KRW", to: "VND", amount: 100000 },
  ];

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Hero */}
      <section className="pt-16 pb-16 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
              {t("label")}
            </span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              {t("title1")}{" "}
              <span style={{ color: "var(--green)" }}>{t("title2")}</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-3 text-sm" style={{ color: "var(--text-2)" }}>
              {t("desc")}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Main converter */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="rounded-2xl border p-8" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              {/* Amount */}
              <div className="mb-6">
                <label className="block text-xs mb-2" style={{ color: "var(--text-3)" }}>{t("labelAmount")}</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border text-2xl mono outline-none transition-colors"
                  style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--green)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  placeholder="1,000,000"
                />
              </div>

              {/* From / Swap / To */}
              <div className="flex items-end gap-3 mb-6">
                <div className="flex-1">
                  <label className="block text-xs mb-2" style={{ color: "var(--text-3)" }}>{t("labelFrom")}</label>
                  <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    {ALL_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={swap}
                  className="p-3 rounded-xl border transition-colors mb-0.5"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text-2)" }}
                  aria-label="Swap"
                >
                  <ArrowLeftRight size={18} />
                </button>
                <div className="flex-1">
                  <label className="block text-xs mb-2" style={{ color: "var(--text-3)" }}>{t("labelTo")}</label>
                  <select
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    {ALL_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result */}
              <div className="rounded-xl border p-6" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
                <div className="text-xs mb-4" style={{ color: "var(--text-3)" }}>{t("labelResult")}</div>
                <div className="space-y-3">
                  {result.buy !== null && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm" style={{ color: "var(--text-3)" }}>{t("labelBuy")}</span>
                      <span className="text-3xl font-semibold mono" style={{ color: "var(--green)" }}>
                        {fmt(result.buy, to)} <span className="text-base font-normal" style={{ color: "var(--text-2)" }}>{to}</span>
                      </span>
                    </div>
                  )}
                  {result.sell !== null && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm" style={{ color: "var(--text-3)" }}>{t("labelSell")}</span>
                      <span className="text-3xl font-semibold mono" style={{ color: "var(--text)" }}>
                        {fmt(result.sell, to)} <span className="text-base font-normal" style={{ color: "var(--text-2)" }}>{to}</span>
                      </span>
                    </div>
                  )}
                  {result.buy === null && result.sell === null && (
                    <span className="text-sm" style={{ color: "var(--text-3)" }}>{t("noData")}</span>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
                  {t("source")}: {t("rateSource")} · {new Date().toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Features */}
          <FadeIn delay={0.16}>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["check1", "check2", "check3"] as const).map((key) => (
                <div key={key} className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
                  <CheckCircle2 size={15} style={{ color: "var(--green)", flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>{t(key)}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quick conversions */}
      <section className="py-16 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--text)" }}>
              {t("quickTitle")}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_PAIRS.map((pair, i) => {
              const res = convertAmount(pair.amount, pair.from, pair.to, rates);
              const val = res.buy ?? res.sell;
              const info = CURRENCIES.find((c) => c.code === (pair.from === "VND" ? pair.to : pair.from));
              return (
                <FadeIn key={i} delay={0.06 * i}>
                  <button
                    onClick={() => { setFrom(pair.from); setTo(pair.to); setAmount(String(pair.amount)); }}
                    className="w-full text-left px-5 py-4 rounded-xl border transition-colors"
                    style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg)")}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info?.dot ?? "#888" }} />
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>
                        {pair.amount.toLocaleString("en-US")} {pair.from} →
                      </span>
                    </div>
                    <div className="text-lg font-semibold mono" style={{ color: "var(--text)" }}>
                      {val !== null ? fmt(val, pair.to) : "—"}{" "}
                      <span className="text-sm font-normal" style={{ color: "var(--text-2)" }}>{pair.to}</span>
                    </div>
                  </button>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bank comparison */}
      {rates.length > 0 && from !== "VND" && to === "VND" && (
        <section className="py-16 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--text)" }}>
                {t("bankCompareTitle", { currency: from })}
              </h2>
            </FadeIn>
            <FadeIn delay={0.08}>
              <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: "var(--border)" }}>
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr style={{ backgroundColor: "var(--surface)" }}>
                      <th className="text-left px-5 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-3)" }}>{t("colBank")}</th>
                      <th className="text-right px-5 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-3)" }}>
                        {t("colBuyAmount", { amount: parsed.toLocaleString("en-US"), currency: from })}
                      </th>
                      <th className="text-right px-5 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-3)" }}>
                        {t("colSellAmount", { amount: parsed.toLocaleString("en-US"), currency: from })}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates
                      .filter((r) => r.currency === from)
                      .map((r, i) => {
                        const bank = BANKS.find((b) => b.code === r.bankCode);
                        const buyResult = r.buyRate ? parsed * r.buyRate : null;
                        const sellResult = r.sellRate ? parsed * r.sellRate : null;
                        return (
                          <tr key={r.bankCode} className="border-t" style={{ borderColor: "var(--border)", backgroundColor: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bank?.color ?? "#888" }} />
                                <span style={{ color: "var(--text)" }}>{r.bankName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right mono" style={{ color: "var(--green)" }}>
                              {buyResult !== null ? Math.round(buyResult).toLocaleString("en-US") : "—"}
                            </td>
                            <td className="px-5 py-3 text-right mono" style={{ color: "var(--text-2)" }}>
                              {sellResult !== null ? Math.round(sellResult).toLocaleString("en-US") : "—"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </FadeIn>
          </div>
        </section>
      )}
    </div>
  );
}
