"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { CURRENCIES } from "@/lib/currencies";
import FadeIn from "@/components/ui/FadeIn";
import { BM_CURRENCIES } from "@/lib/blackMarketConfig";
import type { HistoryPoint } from "@/lib/ratesData";

const PERIODS = [7, 14, 30] as const;
type Period = (typeof PERIODS)[number];

export default function BlackMarketHistoryChart() {
  const t = useTranslations("blackMarket");
  const tc = useTranslations("currencies");
  const [currency, setCurrency] = useState("USD");
  const [days, setDays] = useState<Period>(30);
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/black-market/history?currency=${currency}&days=${days}`)
      .then((r) => r.json())
      .then((d) => { setData(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currency, days]);

  const chartData = data.map((p) => ({ ...p, label: p.date.slice(5) }));

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 items-start justify-between">
        {/* Currency selector */}
        <div className="flex gap-1 flex-wrap">
          {BM_CURRENCIES.map((code) => {
            const info = CURRENCIES.find((c) => c.code === code);
            return (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all"
                style={{
                  color: currency === code ? "var(--text)" : "var(--text-2)",
                  borderColor: currency === code ? "var(--gold)" : "var(--border)",
                  backgroundColor: currency === code ? "rgba(245,158,11,0.1)" : "transparent",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info?.dot ?? "#888" }} />
                {code}
                <span className="hidden sm:inline text-xs" style={{ color: "var(--text-3)" }}>
                  {tc(code as Parameters<typeof tc>[0])}
                </span>
              </button>
            );
          })}
        </div>
        {/* Period selector */}
        <div className="flex gap-1 shrink-0">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setDays(p)}
              className="text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={{
                color: days === p ? "var(--text)" : "var(--text-2)",
                borderColor: days === p ? "var(--border)" : "transparent",
                backgroundColor: days === p ? "var(--surface)" : "transparent",
              }}
            >
              {t(`days${p}` as "days7" | "days14" | "days30")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-sm" style={{ color: "var(--text-3)" }}>
          {t("loading")}
        </div>
      ) : (
        <FadeIn>
          <div
            className="rounded-2xl border p-4 md:p-6"
            style={{ borderColor: "rgba(245,158,11,0.25)", backgroundColor: "var(--surface)" }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--text-3)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-3)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => v.toLocaleString("en-US")}
                  width={76}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface-2, #1a1a1a)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--text)",
                  }}
                  formatter={(value, name) => [
                    (value as number | undefined)?.toLocaleString("en-US") ?? "—",
                    name === "buyRate" ? t("colBMBuy") : t("colBMSell"),
                  ]}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "var(--text-2)", fontSize: "12px" }}>
                      {value === "buyRate" ? t("colBMBuy") : t("colBMSell")}
                    </span>
                  )}
                />
                <Line type="monotone" dataKey="buyRate" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="sellRate" stroke="#888888" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
