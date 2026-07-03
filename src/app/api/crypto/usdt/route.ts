import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SELECT_COLUMNS =
  "collected_at, buy_low, buy_moderate, buy_high, buy_avg, sell_low, sell_moderate, sell_high, sell_avg, vcb_aud_rate";

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
  vcb_aud_rate: number | null;
}

const STAT_KEYS = ["low", "moderate", "high", "avg"] as const;
type StatKey = (typeof STAT_KEYS)[number];

function ratioFor(row: SnapshotRow, side: "buy" | "sell", key: StatKey): number | null {
  const price = row[`${side}_${key}`];
  if (price === null || !row.vcb_aud_rate) return null;
  return price / row.vcb_aud_rate;
}

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD, Vietnam calendar day

  let priorRow: SnapshotRow | null = null;
  let query = supabase.from("usdt_p2p_snapshots").select(SELECT_COLUMNS).order("collected_at", { ascending: false });

  if (dateParam) {
    const startUtc = new Date(`${dateParam}T00:00:00+07:00`).toISOString();
    const endUtc = new Date(`${dateParam}T23:59:59.999+07:00`).toISOString();
    query = query.gte("collected_at", startUtc).lte("collected_at", endUtc);

    const { data: priorData } = await supabase
      .from("usdt_p2p_snapshots")
      .select(SELECT_COLUMNS)
      .lt("collected_at", startUtc)
      .order("collected_at", { ascending: false })
      .limit(1);
    priorRow = (priorData?.[0] as SnapshotRow) ?? null;
  } else {
    query = query.limit(8);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as SnapshotRow[];
  const rowsWithPrior = priorRow ? [...rows, priorRow] : rows;

  const result = rows.map((row, i) => {
    const prevRow = rowsWithPrior[i + 1];

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
      vcbAudRate: row.vcb_aud_rate,
      buy: buildSide("buy"),
      sell: buildSide("sell"),
    };
  });

  return NextResponse.json({ rows: result, updatedAt: new Date().toISOString() });
}
