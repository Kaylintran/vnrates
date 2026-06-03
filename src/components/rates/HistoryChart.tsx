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
import { BANKS } from "@/lib/banks";
import FadeIn from "@/components/ui/FadeIn";
import type { HistoryPoint } from "@/lib/ratesData";

interface Props {
  currency: string;
}

const PERIODS = [7, 14, 30] as const;
type Period = (typeof PERIODS)[number];

export default function HistoryChart({ currency }: Props) {
  const t = useTranslations("rates");
  const [bank, setBank] = useState("VCB");
  const [days, setDays] = useState<Period>(30);
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/rates/history?currency=${currency}&bank=${bank}&days=${days}`)
      .then((r) => r.json())
      .then((d) => { setData(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currency, bank, days]);

  const chartData = data.map((p) => ({ ...p, label: p.date.slice(5) }));

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 items-start justify-between">
        <div className="flex gap-1 overflow-x-auto pb-1 flex-wrap">
          {BANKS.map((b) => (
            <button
              key={b.code}
              onClick={() => setBank(b.code)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all"
              style={{
                color: bank === b.code ? "var(--text)" : "var(--text-2)",
                borderColor: bank === b.code ? b.color : "var(--border)",
                backgroundColor: bank === b.code ? `${b.color}18` : "transparent",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.color }} />
              {b.shortName}
            </button>
          ))}
        </div>
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
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
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
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--text)",
                  }}
                  formatter={(value, name) => [
                    (value as number | undefined)?.toLocaleString("en-US") ?? "—",
                    name === "buyRate" ? t("chartBuy") : t("chartSell"),
                  ]}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "var(--text-2)", fontSize: "12px" }}>
                      {value === "buyRate" ? t("chartBuy") : t("chartSell")}
                    </span>
                  )}
                />
                <Line type="monotone" dataKey="buyRate" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="sellRate" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
