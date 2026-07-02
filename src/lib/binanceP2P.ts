export interface P2PStats {
  low: number;
  moderate: number;
  high: number;
  average: number;
}

export interface USDTP2PSnapshot {
  buy: P2PStats;
  sell: P2PStats;
}

async function fetchP2PAdPrices(tradeType: "BUY" | "SELL"): Promise<number[]> {
  const res = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
    method: "POST",
    signal: AbortSignal.timeout(8000),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
    body: JSON.stringify({
      asset: "USDT",
      fiat: "VND",
      tradeType,
      page: 1,
      rows: 20,
      payTypes: [],
      publisherType: null,
    }),
  });

  if (!res.ok) throw new Error(`Binance P2P API error: ${res.status}`);

  const json = (await res.json()) as {
    data?: Array<{ adv: { price: string } }>;
  };

  const prices = (json.data ?? [])
    .map((item) => parseFloat(item.adv.price))
    .filter((n) => !isNaN(n) && n > 0);

  if (prices.length === 0) throw new Error("Binance P2P API returned no ads");

  return prices;
}

function computeStats(prices: number[]): P2PStats {
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const moderate =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const average = sorted.reduce((sum, n) => sum + n, 0) / sorted.length;

  return {
    low: Math.round(sorted[0]),
    moderate: Math.round(moderate),
    high: Math.round(sorted[sorted.length - 1]),
    average: Math.round(average),
  };
}

/**
 * Binance's tradeType is from the taker's perspective:
 * "SELL" ads (taker sells USDT) map to the site's Buy side (Mua vào).
 * "BUY" ads (taker buys USDT) map to the site's Sell side (Bán ra).
 */
export async function fetchUSDTP2PSnapshot(): Promise<USDTP2PSnapshot> {
  const [buyPrices, sellPrices] = await Promise.all([
    fetchP2PAdPrices("SELL"),
    fetchP2PAdPrices("BUY"),
  ]);

  return {
    buy: computeStats(buyPrices),
    sell: computeStats(sellPrices),
  };
}
