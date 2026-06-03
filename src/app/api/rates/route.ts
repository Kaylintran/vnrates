import { NextRequest, NextResponse } from "next/server";
import { getAllRates, getRatesForDate } from "@/lib/ratesData";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const data = await getRatesForDate(date);
    return NextResponse.json(data);
  }
  const data = await getAllRates();
  return NextResponse.json(data);
}
