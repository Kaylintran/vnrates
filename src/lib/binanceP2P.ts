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

// Binance rejects rows > 20 per page ("illegal parameter"), so scanning the
// whole market means paging through it, not raising "rows".
const ROWS_PER_PAGE = 20;
const MAX_PAGES = 60; // safety cap (~1200 ads) in case Binance ever misreports total

interface P2PPageResult {
  prices: number[];
  total: number;
}

const BATCH_SIZE = 4; // pages fetched concurrently at a time — full parallelism trips Binance's rate limit (429)
const BATCH_DELAY_MS = 300;
const RETRY_DELAYS_MS = [500, 1500]; // backoff schedule for 429s

// Only count ads from verified Binance merchants, and only ads that require a
// minimum single-transaction size of at least this amount — filters out
// small, unverified individual listings that skew the price stats.
const MIN_SINGLE_TRANS_AMOUNT_VND = 90_000_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchP2PAdPage(tradeType: "BUY" | "SELL", page: number): Promise<P2PPageResult> {
  for (let attempt = 0; ; attempt++) {
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
        page,
        rows: ROWS_PER_PAGE,
        payTypes: [],
        publisherType: "merchant",
      }),
    });

    if (res.status === 429 && attempt < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[attempt]);
      continue;
    }
    if (!res.ok) throw new Error(`Binance P2P API error: ${res.status}`);

    const json = (await res.json()) as {
      data?: Array<{ adv: { price: string; minSingleTransAmount: string } }>;
      total?: number;
    };

    const prices = (json.data ?? [])
      .filter((item) => parseFloat(item.adv.minSingleTransAmount) >= MIN_SINGLE_TRANS_AMOUNT_VND)
      .map((item) => parseFloat(item.adv.price))
      .filter((n) => !isNaN(n) && n > 0);

    // `total` reflects the merchant-only count before the min-amount filter above,
    // so it only bounds how many pages exist — it is not the final ad count.
    return { prices, total: json.total ?? prices.length };
  }
}

// Scans the entire current market for this trade type: reads the real ad
// count off the first page, then fetches the remaining pages in small
// concurrent batches (not all at once — that gets rate-limited with a 429).
async function fetchP2PAdPrices(tradeType: "BUY" | "SELL"): Promise<number[]> {
  const first = await fetchP2PAdPage(tradeType, 1);
  const totalPages = Math.min(Math.ceil(first.total / ROWS_PER_PAGE), MAX_PAGES);

  const prices = [...first.prices];
  const remaining = Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => i + 2);

  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((page) => fetchP2PAdPage(tradeType, page)));
    for (const r of results) prices.push(...r.prices);
    if (i + BATCH_SIZE < remaining.length) await sleep(BATCH_DELAY_MS);
  }

  if (prices.length === 0) throw new Error("Binance P2P API returned no ads");

  return prices;
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

// Drops ads whose price sits far outside the bulk of the market (classic
// IQR fence, x1.5) — a merchant can still meet the verification + minimum
// trade-size filters above while listing a stale or mispriced ad.
function removeOutliers(sorted: number[]): number[] {
  if (sorted.length < 4) return sorted; // too few points for a meaningful quartile split
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  const filtered = sorted.filter((p) => p >= lower && p <= upper);
  return filtered.length > 0 ? filtered : sorted;
}

function computeStats(prices: number[]): P2PStats {
  const sorted = removeOutliers([...prices].sort((a, b) => a - b));
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
  // Sequential, not Promise.all — fetching both sides' pages at once doubles
  // the concurrent request burst and makes the Binance rate limit (429) worse.
  const buyPrices = await fetchP2PAdPrices("SELL");
  const sellPrices = await fetchP2PAdPrices("BUY");

  return {
    buy: computeStats(buyPrices),
    sell: computeStats(sellPrices),
  };
}
