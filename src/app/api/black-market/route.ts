import { NextResponse } from "next/server";
import { fetchVCBRates, computeBMRates } from "@/lib/ratesData";

export async function GET() {
  const date = new Date().toISOString().split("T")[0];
  const vcbRates = await fetchVCBRates(date);
  const rates = computeBMRates(vcbRates, date);
  return NextResponse.json({ date, rates, updatedAt: new Date().toISOString() });
}
