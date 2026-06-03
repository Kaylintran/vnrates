import { NextRequest, NextResponse } from "next/server";
import { getBlackMarketHistoricalData } from "@/lib/ratesData";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const currency = searchParams.get("currency") ?? "USD";
  const daysRaw = parseInt(searchParams.get("days") ?? "30", 10);
  const days = isNaN(daysRaw) ? 30 : Math.min(daysRaw, 90);
  const data = getBlackMarketHistoricalData(currency, days);
  return NextResponse.json({ currency, days, data });
}
