import { NextRequest, NextResponse } from "next/server";
import { getHistoricalData } from "@/lib/ratesData";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const currency = searchParams.get("currency") ?? "USD";
  const bank = searchParams.get("bank") ?? "VCB";
  const daysRaw = parseInt(searchParams.get("days") ?? "30", 10);
  const days = isNaN(daysRaw) ? 30 : Math.min(daysRaw, 90);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  const { data: rows, error } = await supabase
    .from("exchange_rates")
    .select("date, buy_rate, sell_rate")
    .eq("bank_code", bank)
    .eq("currency", currency)
    .gte("date", sinceStr)
    .order("date", { ascending: true });

  if (!error && rows && rows.length >= Math.min(days, 3)) {
    const data = rows.map((r) => ({
      date: r.date as string,
      buyRate: r.buy_rate as number | null,
      sellRate: r.sell_rate as number | null,
    }));
    return NextResponse.json({ currency, bank, days, data, source: "supabase" });
  }

  // Fallback to mock data
  const data = getHistoricalData(currency, bank, days);
  return NextResponse.json({ currency, bank, days, data, source: "mock" });
}
