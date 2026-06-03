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

// Other banks expressed as VND offsets from VCB USD base
const BANK_OFFSETS = [
  { code: "VCB",  name: "Vietcombank", buyOffset: 0,   sellOffset: 0   },
  { code: "BIDV", name: "BIDV",        buyOffset: -20,  sellOffset: 10  },
  { code: "VTB",  name: "Vietinbank",  buyOffset: -30,  sellOffset: 5   },
  { code: "TCB",  name: "Techcombank", buyOffset: -50,  sellOffset: 30  },
  { code: "ACB",  name: "ACB",         buyOffset: 10,   sellOffset: -10 },
  { code: "MBB",  name: "MB Bank",     buyOffset: -10,  sellOffset: 20  },
  { code: "VPB",  name: "VPBank",      buyOffset: -40,  sellOffset: 40  },
  { code: "TPB",  name: "TPBank",      buyOffset: -60,  sellOffset: 45  },
  { code: "STB",  name: "Sacombank",   buyOffset: -15,  sellOffset: 15  },
  { code: "EIB",  name: "Eximbank",    buyOffset: -25,  sellOffset: 25  },
];

// Ratios relative to USD (buy ratio, sell ratio) — calibrated from VCB 03/06/2026
const CURRENCY_RATIOS: Record<string, [number, number]> = {
  USD: [1,       1      ],
  EUR: [1.1437,  1.1899 ],
  JPY: [0.006093,0.006403],
  KRW: [0.000575,0.000685],
  CNY: [0.1455,  0.1499 ],
  GBP: [1.3242,  1.3641 ],
  AUD: [0.7060,  0.7274 ],
  SGD: [0.7682,  0.7930 ],
  HKD: [0.1252,  0.1297 ],
  THB: [0.02725, 0.03119],
  CAD: [0.7108,  0.7323 ],
  CHF: [1.2492,  1.2869 ],
};

const SMALL_CURRENCIES = new Set(["JPY", "KRW", "THB"]);

export function buildMockRates(
  date: string,
  vcbUsdBuy = 26100,
  vcbUsdSell = 26400
): ExchangeRate[] {
  const v = dateSeed(date);
  const rates: ExchangeRate[] = [];

  for (const bank of BANK_OFFSETS) {
    const usdBuy  = Math.round((vcbUsdBuy  + bank.buyOffset)  * (1 + v));
    const usdSell = Math.round((vcbUsdSell + bank.sellOffset) * (1 + v));

    for (const [currency, [buyRatio, sellRatio]] of Object.entries(CURRENCY_RATIOS)) {
      const mult = SMALL_CURRENCIES.has(currency) ? 100 : 1;
      rates.push({
        bankCode: bank.code,
        bankName: bank.name,
        currency,
        buyRate:  Math.round(usdBuy  * buyRatio  * mult) / mult,
        sellRate: Math.round(usdSell * sellRatio * mult) / mult,
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
    const today = new Date().toISOString().split("T")[0];
    // VCB API accepts DD/MM/YYYY; empty string = today
    const dateParam = date === today ? "" : date.split("-").reverse().join("/");

    const res = await fetch(
      `https://www.vietcombank.com.vn/api/exchangerates?date=${dateParam}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer": "https://www.vietcombank.com.vn/",
          "Accept": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error(`VCB API error: ${res.status}`);

    const json = await res.json() as {
      UpdatedDate: string;
      Data: Array<{ currencyCode: string; cash: string; transfer: string; sell: string }>;
    };

    const parse = (s: string): number | null => {
      const n = parseFloat(s);
      return isNaN(n) || n === 0 ? null : n;
    };

    const rates: ExchangeRate[] = (json.Data ?? []).map((item) => ({
      bankCode: "VCB",
      bankName: "Vietcombank",
      currency: item.currencyCode,
      buyRate: parse(item.cash),
      sellRate: parse(item.sell),
      transferRate: parse(item.transfer),
      updatedAt: json.UpdatedDate ?? new Date().toISOString(),
      date,
    }));

    return rates.length > 0 ? rates : buildMockRates(date).filter((r) => r.bankCode === "VCB");
  } catch {
    return buildMockRates(date).filter((r) => r.bankCode === "VCB");
  }
}

export async function getAllRates() {
  const date = new Date().toISOString().split("T")[0];
  const vcbRates = await fetchVCBRates(date);

  // Anchor other bank mock rates to real VCB USD rate
  const vcbUSD = vcbRates.find((r) => r.currency === "USD");
  const usdBuy  = vcbUSD?.buyRate  ?? 26100;
  const usdSell = vcbUSD?.sellRate ?? 26400;

  const mockRates = buildMockRates(date, usdBuy, usdSell).filter((r) => r.bankCode !== "VCB");

  return {
    date,
    rates: [...vcbRates, ...mockRates],
    updatedAt: new Date().toISOString(),
  };
}

export async function getRatesForDate(date: string) {
  const today = new Date().toISOString().split("T")[0];
  if (date === today) return getAllRates();

  const vcbRates = await fetchVCBRates(date);
  const vcbUSD  = vcbRates.find((r) => r.currency === "USD");
  const usdBuy  = vcbUSD?.buyRate  ?? 26100;
  const usdSell = vcbUSD?.sellRate ?? 26400;

  const mockRates = buildMockRates(date, usdBuy, usdSell).filter((r) => r.bankCode !== "VCB");
  return { date, rates: [...vcbRates, ...mockRates], updatedAt: `${date}T12:00:00.000Z` };
}

export { BM_CURRENCIES } from "@/lib/blackMarketConfig";

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
  const combined = trend * 0.4 + noise * 0.6;
  const isSmall = currency === "JPY" || currency === "KRW";
  const raw = combined * variation;
  return isSmall ? Math.round(raw * 100) / 100 : Math.round(raw);
}

export function computeBMRates(vcbRates: ExchangeRate[], date: string): BMRate[] {
  const vcbUSD  = vcbRates.find((r) => r.bankCode === "VCB" && r.currency === "USD");
  const usdBuy  = vcbUSD?.buyRate  ?? 26100;
  const usdSell = vcbUSD?.sellRate ?? 26400;
  const mockVCB = buildMockRates(date, usdBuy, usdSell).filter((r) => r.bankCode === "VCB");

  return BM_CURRENCIES.map((currency) => {
    const config = BM_SPREAD_CONFIG[currency];
    const vcb =
      vcbRates.find((r) => r.bankCode === "VCB" && r.currency === currency) ??
      mockVCB.find((r) => r.currency === currency);
    const vcbBuy  = vcb?.buyRate  ?? null;
    const vcbSell = vcb?.sellRate ?? null;
    const variation = bmAbsVariation(currency, date, config.variation);
    const isSmall = currency === "JPY" || currency === "KRW";
    const round = isSmall ? (n: number) => Math.round(n * 100) / 100 : (n: number) => Math.round(n);

    return {
      currency,
      buy:  vcbBuy  !== null ? round(vcbBuy  + config.buySpread  + variation) : null,
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
    const mockVCB = buildMockRates(date).find((r) => r.bankCode === "VCB" && r.currency === currency);
    const vcbBuy  = mockVCB?.buyRate  ?? null;
    const vcbSell = mockVCB?.sellRate ?? null;
    const variation = bmAbsVariation(currency, date, config.variation);
    result.push({
      date,
      buyRate:  vcbBuy  !== null ? round(vcbBuy  + config.buySpread  + variation) : null,
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
