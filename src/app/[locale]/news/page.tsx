"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import { NEWS_ARTICLES } from "@/lib/news";
import type { FetchedNewsItem } from "@/types";

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  rate: { color: "var(--blue)", bg: "rgba(59,130,246,0.12)" },
  bank: { color: "var(--green)", bg: "rgba(34,197,94,0.12)" },
  analysis: { color: "var(--gold)", bg: "rgba(245,158,11,0.12)" },
};

function Sparkline({ data, dir }: { data: number[]; dir: "up" | "down" | "neutral" }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 36;
  const pts = data.map(
    (v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`
  );
  const color =
    dir === "up" ? "var(--green)" : dir === "down" ? "var(--red)" : "var(--text-3)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.9}
      />
      <polyline
        points={pts.join(" ")}
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
    summary:
      locale === "ko"
        ? a.summaryKo
        : locale === "zh-CN"
        ? a.summaryZhCN
        : locale === "zh-TW"
        ? a.summaryZhTW
        : a.summaryVi,
    link: `/news/${a.slug}`,
    publishedAt: a.publishedAt,
    source: "Static",
    tag: a.tag,
    trendData: a.trendData,
    trendDir: a.trend,
  }));
}

export default function NewsPage() {
  const t = useTranslations("news");
  const locale = useLocale();
  const [articles, setArticles] = useState<FetchedNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<"all" | "rate" | "bank" | "analysis">("all");

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => {
        if (data.articles?.length > 0) {
          setArticles(data.articles);
        } else {
          setArticles(staticToFetched(locale));
        }
      })
      .catch(() => {
        setArticles(staticToFetched(locale));
      })
      .finally(() => setLoading(false));
  }, [locale]);

  const filtered =
    activeTag === "all" ? articles : articles.filter((a) => a.tag === activeTag);

  const tagLabel = (tag: string) => {
    if (tag === "rate") return t("tagRate");
    if (tag === "bank") return t("tagBank");
    return t("tagAnalysis");
  };

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <section className="pt-16 pb-12 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--text-3)" }}
            >
              {t("label")}
            </span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1
              className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              {t("title1")}
            </h1>
          </FadeIn>

          {/* Tag filter */}
          <FadeIn delay={0.14}>
            <div className="flex gap-2 mt-6 flex-wrap">
              {(["all", "rate", "bank", "analysis"] as const).map((tag) => {
                const active = activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={{
                      backgroundColor: active ? "var(--blue)" : "transparent",
                      borderColor: active ? "var(--blue)" : "var(--border)",
                      color: active ? "#fff" : "var(--text-2)",
                    }}
                  >
                    {tag === "all" ? t("tagAll") : tagLabel(tag)}
                  </button>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border p-6 h-40 animate-pulse"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((article, i) => {
                const tag = TAG_COLORS[article.tag] ?? TAG_COLORS.rate;
                const isExternal = article.link.startsWith("http");

                return (
                  <FadeIn key={article.id} delay={0.06 * (i % 6)}>
                    {isExternal ? (
                      <a href={article.link} target="_blank" rel="noopener noreferrer">
                        <ArticleCard article={article} tag={tag} tagLabel={tagLabel(article.tag)} readMin={t("readMin")} />
                      </a>
                    ) : (
                      <Link href={article.link}>
                        <ArticleCard article={article} tag={tag} tagLabel={tagLabel(article.tag)} readMin={t("readMin")} />
                      </Link>
                    )}
                  </FadeIn>
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-center py-16 text-sm" style={{ color: "var(--text-3)" }}>
              {t("noArticles")}
            </p>
          )}
        </div>
      </section>
    </div>
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
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface)";
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
        <h2 className="text-sm font-medium leading-snug" style={{ color: "var(--text)" }}>
          {article.title}
        </h2>
        {article.summary && (
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
            {article.summary}
          </p>
        )}
      </div>
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: "var(--text-3)" }}
      >
        <span>{new Date(article.publishedAt).toLocaleDateString("vi-VN")}</span>
        {article.source === "Static" && <span>3 {readMin}</span>}
      </div>
    </article>
  );
}
