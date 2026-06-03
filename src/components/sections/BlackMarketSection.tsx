"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { fmtRate } from "@/lib/utils";
import type { ExchangeRate } from "@/types";

interface BlackMarketRate {
  currency: string;
  buy: number;
  sell: number;
}

const BLACK_MARKET: BlackMarketRate[] = [
  { currency: "USD", buy: 25550, sell: 25650 },
  { currency: "EUR", buy: 27300, sell: 27500 },
  { currency: "JPY", buy: 169.5, sell: 172.0 },
  { currency: "KRW", buy: 18.5, sell: 19.5 },
  { currency: "CNY", buy: 3530, sell: 3600 },
  { currency: "GBP", buy: 31800, sell: 32200 },
];

interface BlackMarketSectionProps {
  rates: ExchangeRate[];
}

export default function BlackMarketSection({ rates }: BlackMarketSectionProps) {
  const t = useTranslations("blackMarket");

  const vcbUsdBuy = rates.find((r) => r.bankCode === "VCB" && r.currency === "USD")?.buyRate ?? 25100;
  const vcbUsdSell = rates.find((r) => r.bankCode === "VCB" && r.currency === "USD")?.sellRate ?? 25450;
  const bmUsd = BLACK_MARKET.find((r) => r.currency === "USD")!;
  const buyDiff = bmUsd.buy - vcbUsdBuy;
  const sellDiff = bmUsd.sell - vcbUsdSell;

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
            <span style={{ color: "var(--gold)" }}>{t("title2")}</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mt-3 text-sm max-w-xl" style={{ color: "var(--text-2)" }}>
            {t("desc")}
          </p>
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main table */}
          <FadeIn delay={0.2} className="lg:col-span-2">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="px-6 py-4 border-b flex items-center gap-2"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
              >
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{
                    color: "var(--gold)",
                    backgroundColor: "rgba(245,158,11,0.12)",
                  }}
                >
                  {t("badge")}
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {t("cardTitle")}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--surface)" }}>
                    <th
                      className="text-left px-6 py-3 text-xs uppercase tracking-wider font-medium"
                      style={{ color: "var(--text-3)" }}
                    >
                      Tiá»n tá»‡
                    </th>
                    <th
                      className="text-right px-6 py-3 text-xs uppercase tracking-wider font-medium"
                      style={{ color: "var(--text-3)" }}
                    >
                      {t("colBuy")}
                    </th>
                    <th
                      className="text-right px-6 py-3 text-xs uppercase tracking-wider font-medium"
                      style={{ color: "var(--text-3)" }}
                    >
                      {t("colSell")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BLACK_MARKET.map((item, i) => (
                    <tr
                      key={item.currency}
                      className="border-t"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor:
                          i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                      }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium" style={{ color: "var(--text)" }}>
                          {item.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right mono" style={{ color: "var(--gold)" }}>
                        {fmtRate(item.buy)}
                      </td>
                      <td className="px-6 py-4 text-right mono" style={{ color: "var(--text-2)" }}>
                        {fmtRate(item.sell)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* Diff card + warning */}
          <FadeIn delay={0.28} className="flex flex-col gap-4">
            <div
              className="rounded-2xl border p-6"
              style={{
                borderColor: "rgba(245,158,11,0.2)",
                backgroundColor: "rgba(245,158,11,0.06)",
              }}
            >
              <div className="text-xs mb-4" style={{ color: "var(--text-3)" }}>
                {t("diffTitle")}
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs mb-1" style={{ color: "var(--text-3)" }}>
                    ChÃªnh lá»‡ch mua
                  </div>
                  <div
                    className="text-2xl font-semibold mono"
                    style={{ color: "var(--gold)" }}
                  >
                    +{fmtRate(buyDiff)}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                    VCB: {fmtRate(vcbUsdBuy)} Â· Chá»£ Ä‘en: {fmtRate(bmUsd.buy)}
                  </div>
                </div>
                <div
                  className="border-t pt-4"
                  style={{ borderColor: "rgba(245,158,11,0.2)" }}
                >
                  <div className="text-xs mb-1" style={{ color: "var(--text-3)" }}>
                    ChÃªnh lá»‡ch bÃ¡n
                  </div>
                  <div
                    className="text-2xl font-semibold mono"
                    style={{ color: "var(--gold)" }}
                  >
                    +{fmtRate(sellDiff)}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                    VCB: {fmtRate(vcbUsdSell)} Â· Chá»£ Ä‘en: {fmtRate(bmUsd.sell)}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl border p-4 flex gap-3"
              style={{
                borderColor: "rgba(239,68,68,0.2)",
                backgroundColor: "rgba(239,68,68,0.06)",
              }}
            >
              <AlertTriangle
                size={16}
                className="shrink-0 mt-0.5"
                style={{ color: "var(--red)" }}
              />
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                {t("warning")}
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
