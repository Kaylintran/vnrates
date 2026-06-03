"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { fmtRate } from "@/lib/utils";
import { CURRENCIES } from "@/lib/currencies";
import type { ExchangeRate } from "@/types";

interface ConverterSectionProps {
  rates: ExchangeRate[];
}

function getVcbRate(
  rates: ExchangeRate[],
  currency: string,
  side: "buy" | "sell"
): number | null {
  const r = rates.find((x) => x.bankCode === "VCB" && x.currency === currency);
  return side === "buy" ? (r?.buyRate ?? null) : (r?.sellRate ?? null);
}

function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRate[]
): { buy: number | null; sell: number | null } {
  if (!amount || isNaN(amount)) return { buy: null, sell: null };
  if (from === to) return { buy: amount, sell: amount };

  if (to === "VND") {
    const buy = getVcbRate(rates, from, "buy");
    const sell = getVcbRate(rates, from, "sell");
    return {
      buy: buy ? amount * buy : null,
      sell: sell ? amount * sell : null,
    };
  }
  if (from === "VND") {
    const toSell = getVcbRate(rates, to, "sell");
    return {
      buy: toSell ? amount / toSell : null,
      sell: null,
    };
  }
  // Cross via VND
  const fromSell = getVcbRate(rates, from, "sell");
  const toSell = getVcbRate(rates, to, "sell");
  if (!fromSell || !toSell) return { buy: null, sell: null };
  const vnd = amount * fromSell;
  return { buy: vnd / toSell, sell: null };
}

const ALL_CURRENCIES = [
  { code: "VND", label: "VND â€” Äá»“ng Viá»‡t Nam" },
  ...CURRENCIES.map((c) => ({ code: c.code, label: `${c.code} â€” ${c.nameVi}` })),
];

export default function ConverterSection({ rates }: ConverterSectionProps) {
  const t = useTranslations("converter");
  const [amount, setAmount] = useState("1000000");
  const [from, setFrom] = useState("VND");
  const [to, setTo] = useState("USD");

  const swap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const parsed = parseFloat(amount.replace(/,/g, ""));
  const result = convertAmount(parsed, from, to, rates);

  const formatResult = (n: number | null) => {
    if (n === null) return "â€”";
    if (n > 1000) return Math.round(n).toLocaleString("en-US");
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const checks = ["check1", "check2", "check3"] as const;

  return (
    <section className="py-16 md:py-32" style={{ backgroundColor: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: copy */}
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
                {t("title1")}
                <br />
                <span style={{ color: "var(--green)" }}>{t("title2")}</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                {t("desc")}
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <ul className="mt-8 space-y-3">
                {checks.map((key) => (
                  <li key={key} className="flex items-center gap-3">
                    <CheckCircle2
                      size={16}
                      style={{ color: "var(--green)", flexShrink: 0 }}
                    />
                    <span className="text-sm" style={{ color: "var(--text-2)" }}>
                      {t(key)}
                    </span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>

          {/* Right: converter */}
          <FadeIn delay={0.12}>
            <div
              className="rounded-2xl border p-6 space-y-5"
              style={{
                backgroundColor: "var(--bg)",
                borderColor: "var(--border)",
              }}
            >
              {/* Amount input */}
              <div>
                <label
                  className="block text-xs mb-2"
                  style={{ color: "var(--text-3)" }}
                >
                  {t("labelAmount")}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm mono outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--green)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                  placeholder="1,000,000"
                />
              </div>

              {/* From / swap / To */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs mb-2" style={{ color: "var(--text-3)" }}>
                    Tá»«
                  </label>
                  <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    {ALL_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={swap}
                  className="mt-5 p-2.5 rounded-lg border transition-colors shrink-0"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface)",
                    color: "var(--text-2)",
                  }}
                  aria-label="Swap currencies"
                >
                  <ArrowLeftRight size={16} />
                </button>
                <div className="flex-1">
                  <label className="block text-xs mb-2" style={{ color: "var(--text-3)" }}>
                    Sang
                  </label>
                  <select
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    {ALL_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result */}
              <div
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="text-xs mb-3" style={{ color: "var(--text-3)" }}>
                  {t("labelResult")}
                </div>
                <div className="space-y-2">
                  {result.buy !== null && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>
                        Mua vÃ o
                      </span>
                      <span
                        className="text-2xl font-semibold mono"
                        style={{ color: "var(--green)" }}
                      >
                        {formatResult(result.buy)}{" "}
                        <span className="text-sm font-normal">{to}</span>
                      </span>
                    </div>
                  )}
                  {result.sell !== null && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>
                        BÃ¡n ra
                      </span>
                      <span
                        className="text-2xl font-semibold mono"
                        style={{ color: "var(--text)" }}
                      >
                        {formatResult(result.sell)}{" "}
                        <span className="text-sm font-normal">{to}</span>
                      </span>
                    </div>
                  )}
                  {result.buy === null && result.sell === null && (
                    <span className="text-sm" style={{ color: "var(--text-3)" }}>
                      â€”
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
                  Nguá»“n: {t("rateSource")} Â· {new Date().toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
