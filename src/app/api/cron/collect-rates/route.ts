import { NextResponse } from "next/server";
import { getAllRates } from "@/lib/ratesData";
import { fetchUSDTP2PSnapshot } from "@/lib/binanceP2P";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const authHeader = req.headers.get("authorization");
  const validKey = key === process.env.CRON_SECRET;
  const validHeader = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  if (!validKey && !validHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, rates } = await getAllRates();

  if (rates.length === 0) {
    return NextResponse.json({ error: "No rates fetched" }, { status: 500 });
  }

  const rows = rates.map((r) => ({
    bank_code: r.bankCode,
    bank_name: r.bankName,
    currency: r.currency,
    buy_rate: r.buyRate,
    sell_rate: r.sellRate,
    transfer_rate: r.transferRate,
    source: r.source,
    date,
  }));

  const { error } = await supabase
    .from("exchange_rates")
    .upsert(rows, { onConflict: "bank_code,currency,date" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const live = rows.filter((r) => r.source === "live").length;
  const estimated = rows.filter((r) => r.source === "estimated").length;

  let usdtSaved = false;
  let usdtError: string | undefined;
  try {
    const vcbUsdRate = rates.find((r) => r.bankCode === "VCB" && r.currency === "USD")?.sellRate ?? null;
    const snapshot = await fetchUSDTP2PSnapshot();
    const { error: usdtInsertError } = await supabase.from("usdt_p2p_snapshots").insert({
      buy_low: snapshot.buy.low,
      buy_moderate: snapshot.buy.moderate,
      buy_high: snapshot.buy.high,
      buy_avg: snapshot.buy.average,
      sell_low: snapshot.sell.low,
      sell_moderate: snapshot.sell.moderate,
      sell_high: snapshot.sell.high,
      sell_avg: snapshot.sell.average,
      vcb_usd_rate: vcbUsdRate,
    });
    if (usdtInsertError) throw new Error(usdtInsertError.message);
    usdtSaved = true;
  } catch (err) {
    usdtError = err instanceof Error ? err.message : "Unknown error";
  }

  return NextResponse.json({ ok: true, date, saved: rows.length, live, estimated, usdtSaved, usdtError });
}
