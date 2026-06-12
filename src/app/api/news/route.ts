import { NextResponse } from "next/server";

export const revalidate = 3600;

export interface FetchedNewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  source: string;
  tag: "rate" | "bank" | "analysis";
  trendData: number[];
  trendDir: "up" | "down" | "neutral";
}

const RSS_FEEDS = [
  { url: "https://cafef.vn/rss/thi-truong-tien-te.rss", source: "CafeF" },
  { url: "https://cafef.vn/rss/ngan-hang.rss", source: "CafeF" },
  { url: "https://vnexpress.net/rss/kinh-doanh/quoc-te.rss", source: "VnExpress" },
];

function detectTag(text: string): "rate" | "bank" | "analysis" {
  if (
    /ngân hàng|vietcombank|bidv|techcombank|vietinbank|nhnn|sbv|mb bank|tpbank|vpbank|sacombank|eximbank|acb/i.test(
      text
    )
  )
    return "bank";
  if (
    /phân tích|dự báo|triển vọng|nhận định|xu hướng|đánh giá|chuyên gia|dự đoán/i.test(
      text
    )
  )
    return "analysis";
  return "rate";
}

function hashId(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

function seedTrend(
  id: string,
  tag: string
): { data: number[]; dir: "up" | "down" | "neutral" } {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h) ^ id.charCodeAt(i);
  }
  const base = tag === "bank" ? 25800 : tag === "analysis" ? 27200 : 26100;
  const data = Array.from({ length: 7 }, (_, i) => {
    const n = ((h >>> 0) + i * 7919) % 1000;
    return base + (n / 1000 - 0.5) * 600;
  });
  const dir =
    data[6] > data[0] + 50 ? "up" : data[6] < data[0] - 50 ? "down" : "neutral";
  return { data, dir };
}

function extractCdata(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

async function fetchFeed(
  url: string,
  source: string
): Promise<FetchedNewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: FetchedNewsItem[] = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const block = match[1];

      const titleRaw =
        block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? "";
      const title = extractCdata(titleRaw);

      const linkRaw =
        block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] ??
        block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] ??
        "";
      const link = extractCdata(linkRaw);

      const descRaw =
        block.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ?? "";
      const summary = extractCdata(descRaw).slice(0, 200);

      const pubDateRaw =
        block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1] ?? "";
      const pubDate = pubDateRaw.trim();

      if (!title || !link) continue;

      let publishedAt: string;
      try {
        publishedAt = new Date(pubDate).toISOString().split("T")[0];
      } catch {
        publishedAt = new Date().toISOString().split("T")[0];
      }

      const id = hashId(link);
      const tag = detectTag(title + " " + summary);
      const { data: trendData, dir: trendDir } = seedTrend(id, tag);

      items.push({ id, title, summary, link, publishedAt, source, tag, trendData, trendDir });
    }

    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  const results = await Promise.all(
    RSS_FEEDS.map((feed) => fetchFeed(feed.url, feed.source))
  );

  const seen = new Set<string>();
  const all: FetchedNewsItem[] = [];

  for (const item of results.flat()) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      all.push(item);
    }
  }

  all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return NextResponse.json({
    articles: all.slice(0, 12),
    updatedAt: new Date().toISOString(),
  });
}
