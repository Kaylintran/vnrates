import { NextRequest, NextResponse } from "next/server";
import { getHistoricalData } from "@/lib/ratesData";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const currency = searchParams.get("currency") ?? "USD";
  const bank = searchParams.get("bank") ?? "VCB";
  const daysRaw = parseInt(searchParams.get("days") ?? "30", 10);
  const days = isNaN(daysRaw) ? 30 : Math.min(daysRaw, 90);
  const data = getHistoricalData(currency, bank, days);
  return NextResponse.json({ currency, bank, days, data });
}
