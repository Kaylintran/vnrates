import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface SnapshotRow {
  collected_at: string;
  buy_low: number | null;
  buy_moderate: number | null;
  buy_high: number | null;
  buy_avg: number | null;
  sell_low: number | null;
  sell_moderate: number | null;
  sell_high: number | null;
  sell_avg: number | null;
  vcb_usd_rate: number | null;
}

const STAT_KEYS = ["low", "moderate", "high", "avg"] as const;
type StatKey = (typeof STAT_KEYS)[number];

function ratioFor(row: SnapshotRow, side: "buy" | "sell", key: StatKey): number | null {
  const price = row[`${side}_${key}`];
  if (price === null || !row.vcb_usd_rate) return null;
  return price / row.vcb_usd_rate;
}

export async function GET() {
  const { data, error } = await supabase
    .from("usdt_p2p_snapshots")
    .select("collected_at, buy_low, buy_moderate, buy_high, buy_avg, sell_low, sell_moderate, sell_high, sell_avg, vcb_usd_rate")
    .order("collected_at", { ascending: false })
    .limit(8);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as SnapshotRow[];

  const result = rows.map((row, i) => {
    const prevRow = rows[i + 1];

    const buildSide = (side: "buy" | "sell") => {
      const stats: Record<StatKey, number | null> = { low: row[`${side}_low`], moderate: row[`${side}_moderate`], high: row[`${side}_high`], avg: row[`${side}_avg`] };
      const ratios: Record<StatKey, number | null> = {} as Record<StatKey, number | null>;
      const variance: Record<StatKey, number | null> = {} as Record<StatKey, number | null>;

      for (const key of STAT_KEYS) {
        const ratio = ratioFor(row, side, key);
        ratios[key] = ratio;
        const prevRatio = prevRow ? ratioFor(prevRow, side, key) : null;
        variance[key] = ratio !== null && prevRatio ? ((ratio - prevRatio) / prevRatio) * 100 : null;
      }

      return { stats, ratios, variance };
    };

    return {
      collectedAt: row.collected_at,
      vcbUsdRate: row.vcb_usd_rate,
      buy: buildSide("buy"),
      sell: buildSide("sell"),
    };
  });

  return NextResponse.json({ rows: result, updatedAt: new Date().toISOString() });
}
