"use client";

import { fmtRate } from "@/lib/utils";
import type { ExchangeRate } from "@/types";

const TICKER_CURRENCIES = ["USD", "EUR", "JPY", "KRW", "CNY", "GBP", "AUD", "SGD"];

interface TickerProps {
  rates?: ExchangeRate[];
}

const FALLBACK_RATES: Record<string, { buy: number; sell: number }> = {
  USD: { buy: 25100, sell: 25450 },
  EUR: { buy: 26870, sell: 27950 },
  JPY: { buy: 163.5, sell: 170.2 },
  KRW: { buy: 17.83, sell: 19.2 },
  CNY: { buy: 3450, sell: 3580 },
  GBP: { buy: 31200, sell: 32850 },
  AUD: { buy: 16050, sell: 16900 },
  SGD: { buy: 18500, sell: 19350 },
};

export default function Ticker({ rates = [] }: TickerProps) {
  const items = TICKER_CURRENCIES.map((currency) => {
    const vcb = rates.find((r) => r.bankCode === "VCB" && r.currency === currency);
    const buy = vcb?.buyRate ?? FALLBACK_RATES[currency]?.buy ?? 0;
    const sell = vcb?.sellRate ?? FALLBACK_RATES[currency]?.sell ?? 0;
    return { currency, buy, sell };
  });

  const tickerContent = [...items, ...items].map((item, i) => (
    <span key={i} className="flex items-center gap-3 shrink-0">
      <span
        className="font-medium text-xs tracking-wide"
        style={{ color: "var(--text)" }}
      >
        {item.currency}
      </span>
      <span className="text-xs mono" style={{ color: "var(--green)" }}>
        {fmtRate(item.buy)}
      </span>
      <span className="text-xs" style={{ color: "var(--text-3)" }}>
        /
      </span>
      <span className="text-xs mono" style={{ color: "var(--text-2)" }}>
        {fmtRate(item.sell)}
      </span>
      <span
        className="w-px h-3 mx-4"
        style={{ backgroundColor: "var(--border)" }}
      />
    </span>
  ));

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 overflow-hidden border-b"
      style={{
        backgroundColor: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(8px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="py-2 flex animate-ticker whitespace-nowrap">
        {tickerContent}
      </div>
    </div>
  );
}
