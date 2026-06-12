"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import { NEWS_ARTICLES } from "@/lib/news";
import type { FetchedNewsItem } from "@/types";

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  rate: { color: "var(--blue)", bg: "rgba(59,130,246,0.12)" },
  bank: { color: "var(--green)", bg: "rgba(34,197,94,0.12)" },
  analysis: { color: "var(--gold)", bg: "rgba(245,158,11,0.12)" },
};

function Sparkline({
  data,
  dir,
}: {
  data: number[];
  dir: "up" | "down" | "neutral";
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const color =
    dir === "up" ? "var(--green)" : dir === "down" ? "var(--red)" : "var(--text-3)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.9}
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.12}
      />
    </svg>
  );
}

// Convert static hardcoded articles to FetchedNewsItem format as fallback
function staticToFetched(locale: string): FetchedNewsItem[] {
  return NEWS_ARTICLES.map((a) => ({
    id: a.id,
    title:
      locale === "ko"
        ? a.titleKo
        : locale === "zh-CN"
        ? a.titleZhCN
        : locale === "zh-TW"
        ? a.titleZhTW
        : a.titleVi,
    summary: a.summaryVi,
    link: `/news/${a.slug}`,
    publishedAt: a.publishedAt,
    source: "Static",
    tag: a.tag,
    trendData: a.trendData,
    trendDir: a.trend,
  }));
}

export default function NewsSection() {
  const t = useTranslations("news");
  const [articles, setArticles] = useState<FetchedNewsItem[]>([]);
  const [locale, setLocale] = useState("vi");

  useEffect(() => {
    const detectedLocale =
      typeof window !== "undefined"
        ? window.location.pathname.split("/")[1] || "vi"
        : "vi";
    setLocale(detectedLocale);

    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => {
        if (data.articles?.length > 0) {
          setArticles(data.articles.slice(0, 6));
        } else {
          setArticles(staticToFetched(detectedLocale).slice(0, 6));
        }
      })
      .catch(() => {
        setArticles(staticToFetched(detectedLocale).slice(0, 6));
      });
  }, []);

  // Show static articles while loading (SSR-safe)
  const displayArticles =
    articles.length > 0 ? articles : staticToFetched("vi").slice(0, 6);

  return (
    <section className="py-16 md:py-32" style={{ backgroundColor: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <FadeIn>
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                {t("label")}
              </span>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h2
                className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight"
                style={{ color: "var(--text)" }}
              >
                {t("title1")}
                {t("title2") && (
                  <>
                    <br />
                    <span style={{ color: "var(--green)" }}>{t("title2")}</span>
                  </>
                )}
              </h2>
            </FadeIn>
          </div>
          <FadeIn delay={0.12}>
            <Link
              href="/news"
              className="text-sm transition-colors"
              style={{ color: "var(--text-2)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-2)")
              }
            >
              {t("viewAll")} →
            </Link>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayArticles.map((article, i) => {
            const tag = TAG_COLORS[article.tag] ?? TAG_COLORS.rate;
            const tagLabel =
              article.tag === "bank"
                ? t("tagBank")
                : article.tag === "analysis"
                ? t("tagAnalysis")
                : t("tagRate");
            const isExternal = article.link.startsWith("http");

            return (
              <FadeIn key={article.id} delay={0.06 * (i % 6)}>
                {isExternal ? (
                  <a href={article.link} target="_blank" rel="noopener noreferrer">
                    <ArticleCard
                      article={article}
                      tag={tag}
                      tagLabel={tagLabel}
                      readMin={t("readMin")}
                    />
                  </a>
                ) : (
                  <Link href={article.link}>
                    <ArticleCard
                      article={article}
                      tag={tag}
                      tagLabel={tagLabel}
                      readMin={t("readMin")}
                    />
                  </Link>
                )}
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ArticleCard({
  article,
  tag,
  tagLabel,
  readMin,
}: {
  article: FetchedNewsItem;
  tag: { color: string; bg: string };
  tagLabel: string;
  readMin: string;
}) {
  return (
    <article
      className="rounded-2xl border p-6 h-full flex flex-col gap-4 transition-colors"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          "rgba(255,255,255,0.025)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg)";
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs px-2 py-0.5 rounded font-medium"
          style={{ color: tag.color, backgroundColor: tag.bg }}
        >
          {tagLabel}
        </span>
        <div className="flex items-center gap-2">
          {article.source !== "Static" && (
            <span className="text-xs" style={{ color: "var(--text-3)" }}>
              {article.source}
            </span>
          )}
          <Sparkline data={article.trendData} dir={article.trendDir} />
        </div>
      </div>
      <div className="flex-1">
        <h3
          className="text-sm font-medium leading-snug"
          style={{ color: "var(--text)" }}
        >
          {article.title}
        </h3>
      </div>
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: "var(--text-3)" }}
      >
        <span>{new Date(article.publishedAt).toLocaleDateString("vi-VN")}</span>
        {article.source === "Static" && (
          <span>
            3 {readMin}
          </span>
        )}
      </div>
    </article>
  );
}
