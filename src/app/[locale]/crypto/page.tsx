"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import DatePicker from "@/components/ui/DatePicker";
import { fmtRate } from "@/lib/utils";
import CTASection from "@/components/sections/CTASection";

interface StatBlock {
  stats: Record<"low" | "moderate" | "high" | "avg", number | null>;
  ratios: Record<"low" | "moderate" | "high" | "avg", number | null>;
  variance: Record<"low" | "moderate" | "high" | "avg", number | null>;
}

interface SnapshotRow {
  collectedAt: string;
  vcbAudRate: number | null;
  buy: StatBlock;
  sell: StatBlock;
}

const BUY_ORDER = ["low", "moderate", "high", "avg"] as const;
const SELL_ORDER = ["high", "moderate", "low", "avg"] as const;

function fmtRatio(n: number | null): string {
  if (n === null) return "—";
  return n.toFixed(3);
}

function fmtVariance(n: number | null): { text: string; color: string } {
  if (n === null) return { text: "", color: "var(--text-3)" };
  const sign = n >= 0 ? "+" : "";
  return {
    text: `${sign}${n.toFixed(2)}%`,
    color: n >= 0 ? "var(--green)" : "var(--red)",
  };
}

const TODAY_VN = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

export default function CryptoPage() {
  const t = useTranslations("crypto");
  const locale = useLocale();
  const [rows, setRows] = useState<SnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    setLoading(true);
    const url = selectedDate ? `/api/crypto/usdt?date=${selectedDate}` : "/api/crypto/usdt";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const statLabel: Record<(typeof BUY_ORDER)[number], string> = {
    low: t("colLow"),
    moderate: t("colModerate"),
    high: t("colHigh"),
    avg: t("colAverage"),
  };

  const fmtTime = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  function renderSideTable(
    side: "buy" | "sell",
    order: readonly (keyof StatBlock["stats"])[],
    color: string,
    tint: string,
    groupLabel: string,
    delay: number
  ) {
    return (
      <FadeIn delay={delay}>
        <h3 className="text-sm font-medium mb-3" style={{ color }}>
          {groupLabel}
        </h3>
        <div className="rounded-2xl border overflow-auto max-h-[260px]" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th
                  className="sticky top-0 z-10 text-left px-2 py-3 text-[11px] uppercase tracking-wide font-medium whitespace-nowrap"
                  style={{ color: "var(--text-3)", backgroundColor: tint }}
                >
                  {t("colTime")}
                </th>
                {order.map((key) => (
                  <th
                    key={`price-${key}`}
                    className="sticky top-0 z-10 text-right px-2 py-3 text-[11px] uppercase tracking-wide font-medium"
                    style={{ color, backgroundColor: tint }}
                  >
                    {statLabel[key]}
                  </th>
                ))}
                {order.map((key) => (
                  <th
                    key={`ratio-${key}`}
                    className="sticky top-0 z-10 text-right px-2 py-3 text-[11px] uppercase tracking-wide font-medium leading-tight"
                    style={{ color: "var(--text-3)", backgroundColor: tint }}
                  >
                    {t("colRatio")} {statLabel[key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const block = row[side];
                return (
                  <tr
                    key={row.collectedAt}
                    className="border-t"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                    }}
                  >
                    <td className="px-2 py-3 whitespace-nowrap text-xs" style={{ color: "var(--text-2)" }}>
                      {fmtTime(row.collectedAt)}
                    </td>
                    {order.map((key) => (
                      <td key={`price-${key}`} className="px-2 py-3 text-right mono" style={{ color: "var(--text)" }}>
                        {fmtRate(block.stats[key])}
                      </td>
                    ))}
                    {order.map((key) => {
                      const variance = fmtVariance(block.variance[key]);
                      return (
                        <td key={`ratio-${key}`} className="px-2 py-3 text-right mono">
                          <div style={{ color: "var(--text-2)" }}>{fmtRatio(block.ratios[key])}</div>
                          {variance.text && (
                            <div className="text-xs" style={{ color: variance.color }}>{variance.text}</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </FadeIn>
    );
  }

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
        </div>
      </section>

      {/* Warning banner */}
      <div className="border-b" style={{ borderColor: "rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.05)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-3 items-start">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: "var(--red)" }} />
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{t("warning")}</p>
        </div>
      </div>

      {/* Table */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>
                  {t("tableTitle")}
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{t("ratioNote")}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                  {t("dateLabel")}
                </label>
                <DatePicker value={selectedDate} onChange={setSelectedDate} max={TODAY_VN()} />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="text-xs px-3 py-2 rounded-lg border transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--text-2)" }}
                  >
                    {t("dateLatest")}
                  </button>
                )}
              </div>
            </div>
          </FadeIn>

          {loading ? (
            <p className="text-sm" style={{ color: "var(--text-3)" }}>{t("loading")}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-3)" }}>{t("noData")}</p>
          ) : (
            <div className="space-y-5">
              {renderSideTable("buy", BUY_ORDER, "var(--green)", "#0b150f", t("groupBuy"), 0.08)}
              {renderSideTable("sell", SELL_ORDER, "var(--red)", "#180d0d", t("groupSell"), 0.16)}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </div>
  );
}
