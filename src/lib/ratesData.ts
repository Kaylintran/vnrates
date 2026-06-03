import type { ExchangeRate } from "@/types";
import { BM_SPREAD_CONFIG, BM_CURRENCIES, type BMRate } from "@/lib/blackMarketConfig";

export interface HistoryPoint {
  date: string;
  buyRate: number | null;
  sellRate: number | null;
}

function dateSeed(date: string): number {
  const epoch = Math.floor(new Date(date + "T00:00:00Z").getTime() / 86400000);
  const trend = Math.sin(epoch / 18) * 0.012 + Math.cos(epoch / 40) * 0.006;
  let h = 5381;
  for (let i = 0; i < date.length; i++) {
    h = ((h << 5) + h) ^ date.charCodeAt(i);
  }
  const noise = (((h >>> 0) % 10000) / 10000 - 0.5) * 0.007;
  return trend + noise;
}

export function buildMockRates(date: string): ExchangeRate[] {
  const v = dateSeed(date);
  const banks = [
    { code: "VCB", name: "Vietcombank", usdBuy: Math.round(25100 * (1 + v)), usdSell: Math.round(25450 * (1 + v)) },
    { code: "BIDV", name: "BIDV", usdBuy: Math.round(25080 * (1 + v)), usdSell: Math.round(25460 * (1 + v)) },
    { code: "VTB", name: "Vietinbank", usdBuy: Math.round(25070 * (1 + v)), usdSell: Math.round(25455 * (1 + v)) },
    { code: "TCB", name: "Techcombank", usdBuy: Math.round(25050 * (1 + v)), usdSell: Math.round(25480 * (1 + v)) },
    { code: "ACB", name: "ACB", usdBuy: Math.round(25110 * (1 + v)), usdSell: Math.round(25440 * (1 + v)) },
    { code: "MBB", name: "MB Bank", usdBuy: Math.round(25090 * (1 + v)), usdSell: Math.round(25470 * (1 + v)) },
    { code: "VPB", name: "VPBank", usdBuy: Math.round(25060 * (1 + v)), usdSell: Math.round(25490 * (1 + v)) },
    { code: "TPB", name: "TPBank", usdBuy: Math.round(25040 * (1 + v)), usdSell: Math.round(25495 * (1 + v)) },
    { code: "STB", name: "Sacombank", usdBuy: Math.round(25085 * (1 + v)), usdSell: Math.round(25465 * (1 + v)) },
    { code: "EIB", name: "Eximbank", usdBuy: Math.round(25075 * (1 + v)), usdSell: Math.round(25475 * (1 + v)) },
  ];

  const ratios: Record<string, [number, number]> = {
    USD: [1, 1],
    EUR: [1.0698, 1.0981],
    JPY: [0.00651, 0.0068],
    KRW: [0.000711, 0.000757],
    CNY: [0.1375, 0.1407],
    GBP: [1.244, 1.2892],
    AUD: [0.6404, 0.6637],
    SGD: [0.7338, 0.762],
    HKD: [0.1253, 0.1309],
    THB: [0.0268, 0.0278],
    CAD: [0.7181, 0.745],
    CHF: [1.0802, 1.1093],
  };

  const smallCurrencies = new Set(["JPY", "KRW", "THB"]);
  const rates: ExchangeRate[] = [];

  for (const bank of banks) {
    for (const [currency, [buyRatio, sellRatio]] of Object.entries(ratios)) {
      const mult = smallCurrencies.has(currency) ? 100 : 1;
      rates.push({
        bankCode: bank.code,
        bankName: bank.name,
        currency,
        buyRate: Math.round(bank.usdBuy * buyRatio * mult) / mult,
        sellRate: Math.round(bank.usdSell * sellRatio * mult) / mult,
        transferRate: null,
        updatedAt: new Date().toISOString(),
        date,
      });
    }
  }
  return rates;
}

export async function fetchVCBRates(date: string): Promise<ExchangeRate[]> {
  try {
    const res = await fetch(
      "https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TVExchageRate/pXML.aspx?b=10",
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error("VCB API error");
    const xml = await res.text();

    const rates: ExchangeRate[] = [];
    const regex =
      /<Exrate\s+CurrencyCode="([^"]+)"\s+CurrencyName="([^"]+)"\s+Buy="([^"]+)"\s+Transfer="([^"]+)"\s+Sell="([^"]+)"/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const [, code, , buy, transfer, sell] = match;
      const parse = (s: string) => {
        const n = parseFloat(s.replace(/,/g, ""));
        return isNaN(n) ? null : n;
      };
      rates.push({
        bankCode: "VCB",
        bankName: "Vietcombank",
        currency: code.trim(),
        buyRate: parse(buy),
        sellRate: parse(sell),
        transferRate: parse(transfer),
        updatedAt: new Date().toISOString(),
        date,
      });
    }
    return rates.length > 0 ? rates : buildMockRates(date).filter((r) => r.bankCode === "VCB");
  } catch {
    return buildMockRates(date).filter((r) => r.bankCode === "VCB");
  }
}

export async function getAllRates() {
  const date = new Date().toISOString().split("T")[0];
  const [vcbRates, mockRates] = await Promise.all([
    fetchVCBRates(date),
    Promise.resolve(buildMockRates(date).filter((r) => r.bankCode !== "VCB")),
  ]);
  return {
    date,
    rates: [...vcbRates, ...mockRates],
    updatedAt: new Date().toISOString(),
  };
}

export async function getRatesForDate(date: string) {
  const today = new Date().toISOString().split("T")[0];
  if (date === today) return getAllRates();
  const rates = buildMockRates(date);
  return { date, rates, updatedAt: `${date}T12:00:00.000Z` };
}

// Re-export for backward compat with existing imports
export { BM_CURRENCIES } from "@/lib/blackMarketConfig";

// Deterministic daily variation: returns an absolute VND offset in range [-variation, +variation]
function bmAbsVariation(currency: string, date: string, variation: number): number {
  if (variation === 0) return 0;
  const epoch = Math.floor(new Date(date + "T00:00:00Z").getTime() / 86400000);
  const trend = Math.sin(epoch / 20) * 0.5 + Math.cos(epoch / 45) * 0.2;
  let h = 7919;
  const str = `${currency}:${date}`;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  const noise = (((h >>> 0) % 10000) / 10000) - 0.5;
  const combined = trend * 0.4 + noise * 0.6; // roughly -0.58 to +0.58
  const isSmall = currency === "JPY" || currency === "KRW";
  const raw = combined * variation;
  return isSmall ? Math.round(raw * 100) / 100 : Math.round(raw);
}

// Compute BM rates from a set of VCB rates + the user-configured spread formula
export function computeBMRates(vcbRates: ExchangeRate[], date: string): BMRate[] {
  // Fallback to mock VCB rates if a currency is missing in vcbRates
  const mockVCB = buildMockRates(date).filter((r) => r.bankCode === "VCB");

  return BM_CURRENCIES.map((currency) => {
    const config = BM_SPREAD_CONFIG[currency];
    const vcb =
      vcbRates.find((r) => r.bankCode === "VCB" && r.currency === currency) ??
      mockVCB.find((r) => r.currency === currency);
    const vcbBuy = vcb?.buyRate ?? null;
    const vcbSell = vcb?.sellRate ?? null;
    const variation = bmAbsVariation(currency, date, config.variation);
    const isSmall = currency === "JPY" || currency === "KRW";
    const round = isSmall ? (n: number) => Math.round(n * 100) / 100 : (n: number) => Math.round(n);

    return {
      currency,
      buy: vcbBuy !== null ? round(vcbBuy + config.buySpread + variation) : null,
      sell: vcbSell !== null ? round(vcbSell + config.sellSpread + variation) : null,
      vcbBuy,
      vcbSell,
    };
  });
}

export function getBlackMarketHistoricalData(currency: string, days: number): HistoryPoint[] {
  const config = BM_SPREAD_CONFIG[currency];
  if (!config) return [];
  const isSmall = currency === "JPY" || currency === "KRW";
  const round = isSmall ? (n: number) => Math.round(n * 100) / 100 : (n: number) => Math.round(n);

  const result: HistoryPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];

    // Use mock VCB rate as the historical baseline (real historical VCB not available)
    const mockVCB = buildMockRates(date).find((r) => r.bankCode === "VCB" && r.currency === currency);
    const vcbBuy = mockVCB?.buyRate ?? null;
    const vcbSell = mockVCB?.sellRate ?? null;
    const variation = bmAbsVariation(currency, date, config.variation);

    result.push({
      date,
      buyRate: vcbBuy !== null ? round(vcbBuy + config.buySpread + variation) : null,
      sellRate: vcbSell !== null ? round(vcbSell + config.sellSpread + variation) : null,
    });
  }
  return result;
}

export function getHistoricalData(currency: string, bankCode: string, days: number): HistoryPoint[] {
  const result: HistoryPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    const rate = buildMockRates(date).find((r) => r.currency === currency && r.bankCode === bankCode);
    result.push({ date, buyRate: rate?.buyRate ?? null, sellRate: rate?.sellRate ?? null });
  }
  return result;
}
