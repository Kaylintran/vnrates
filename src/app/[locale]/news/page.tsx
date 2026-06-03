"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import { NEWS_ARTICLES } from "@/lib/news";
import type { NewsArticle } from "@/types";

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  rate: { color: "var(--blue)", bg: "rgba(59,130,246,0.12)" },
  bank: { color: "var(--green)", bg: "rgba(34,197,94,0.12)" },
  analysis: { color: "var(--gold)", bg: "rgba(245,158,11,0.12)" },
};

function getTitle(article: NewsArticle, locale: string): string {
  if (locale === "ko") return article.titleKo;
  if (locale === "zh-CN") return article.titleZhCN;
  if (locale === "zh-TW") return article.titleZhTW;
  return article.titleVi;
}

function getSummary(article: NewsArticle, locale: string): string {
  if (locale === "ko") return article.summaryKo;
  if (locale === "zh-CN") return article.summaryZhCN;
  if (locale === "zh-TW") return article.summaryZhTW;
  return article.summaryVi;
}

function Sparkline({ data, trend }: { data: number[]; trend: "up" | "down" | "neutral" }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 36;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`);
  const color = trend === "up" ? "var(--green)" : trend === "down" ? "var(--red)" : "var(--text-3)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" opacity={0.12} />
    </svg>
  );
}

const ALL_TAGS = ["all", "rate", "bank", "analysis"] as const;

export default function NewsPage() {
  const t = useTranslations("news");
  const locale = useLocale();

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <section className="pt-16 pb-12 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
              {t("label")}
            </span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              {t("title1")} <span style={{ color: "var(--green)" }}>{t("title2")}</span>
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {NEWS_ARTICLES.map((article, i) => {
              const tag = TAG_COLORS[article.tag] ?? TAG_COLORS.rate;
              const tagLabel =
                article.tag === "rate"
                  ? t("tagRate")
                  : article.tag === "bank"
                  ? t("tagBank")
                  : t("tagAnalysis");
              return (
                <FadeIn key={article.id} delay={0.06 * (i % 6)}>
                  <Link href={`/news/${article.slug}`}>
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
                        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ color: tag.color, backgroundColor: tag.bg }}>
                          {tagLabel}
                        </span>
                        <Sparkline data={article.trendData} trend={article.trend} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-sm font-medium leading-snug" style={{ color: "var(--text)" }}>
                          {getTitle(article, locale)}
                        </h2>
                        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                          {getSummary(article, locale)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-3)" }}>
                        <span>{new Date(article.publishedAt).toLocaleDateString("vi-VN")}</span>
                        <span>{article.readMinutes} {t("readMin")}</span>
                      </div>
                    </article>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
