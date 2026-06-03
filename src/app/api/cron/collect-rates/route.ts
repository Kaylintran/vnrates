import { NextResponse } from "next/server";
import { fetchVCBRates } from "@/lib/ratesData";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = new Date().toISOString().split("T")[0];
  const vcbRates = await fetchVCBRates(date);

  if (vcbRates.length === 0) {
    return NextResponse.json({ error: "No VCB rates fetched" }, { status: 500 });
  }

  const rows = vcbRates.map((r) => ({
    bank_code: r.bankCode,
    bank_name: r.bankName,
    currency: r.currency,
    buy_rate: r.buyRate,
    sell_rate: r.sellRate,
    transfer_rate: r.transferRate,
    date,
  }));

  const { error } = await supabase
    .from("exchange_rates")
    .upsert(rows, { onConflict: "bank_code,currency,date" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, date, saved: rows.length });
}
