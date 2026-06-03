import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NEWS_ARTICLES } from "@/lib/news";
import { locales } from "@/i18n/config";
import type { NewsArticle } from "@/types";
import FadeIn from "@/components/ui/FadeIn";
import CTASection from "@/components/sections/CTASection";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
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

const TAG_LABELS: Record<string, Record<string, string>> = {
  rate: { vi: "Tỷ giá", ko: "환율", "zh-CN": "汇率", "zh-TW": "匯率" },
  bank: { vi: "Ngân hàng", ko: "은행", "zh-CN": "银行", "zh-TW": "銀行" },
  analysis: { vi: "Phân tích", ko: "분석", "zh-CN": "分析", "zh-TW": "分析" },
};

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  rate: { color: "var(--blue)", bg: "rgba(59,130,246,0.12)" },
  bank: { color: "var(--green)", bg: "rgba(34,197,94,0.12)" },
  analysis: { color: "var(--gold)", bg: "rgba(245,158,11,0.12)" },
};

const MOCK_BODY: Record<string, string> = {
  vi: `Thị trường ngoại hối Việt Nam tiếp tục ghi nhận những biến động đáng chú ý trong phiên giao dịch hôm nay. Các ngân hàng thương mại lớn đã điều chỉnh tỷ giá để phản ánh diễn biến trên thị trường quốc tế.

Vietcombank, ngân hàng thương mại đứng đầu về khối lượng giao dịch ngoại tệ, đã tăng tỷ giá mua vào và bán ra USD thêm 50 đồng so với phiên trước. Động thái này phản ánh áp lực từ đồng USD mạnh hơn trên thị trường quốc tế.

Ngân hàng Nhà nước Việt Nam tiếp tục theo dõi sát diễn biến thị trường và sẵn sàng can thiệp nếu biến động quá mức. Tỷ giá trung tâm ngày hôm nay được công bố ở mức 24,250 đồng/USD, tăng 12 đồng so với phiên liền kề.

Các chuyên gia kinh tế nhận định rằng áp lực tỷ giá có thể kéo dài trong ngắn hạn do dữ liệu kinh tế Mỹ tiếp tục tích cực, đặc biệt là báo cáo việc làm phi nông nghiệp vừa công bố.`,
  ko: `베트남 외환 시장이 오늘 세션에서 주목할 만한 변동을 기록했습니다. 주요 상업 은행들이 국제 시장 동향을 반영하기 위해 환율을 조정했습니다.`,
  "zh-CN": `越南外汇市场在今天的交易中记录了值得关注的波动。主要商业银行调整了汇率以反映国际市场动态。`,
  "zh-TW": `越南外匯市場在今天的交易中記錄了值得關注的波動。主要商業銀行調整了匯率以反映國際市場動態。`,
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    NEWS_ARTICLES.map((article) => ({ locale, slug: article.slug }))
  );
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  const article = NEWS_ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  const tag = TAG_COLORS[article.tag] ?? TAG_COLORS.rate;
  const tagLabel = TAG_LABELS[article.tag]?.[locale] ?? TAG_LABELS[article.tag]?.vi ?? "";
  const body = MOCK_BODY[locale] ?? MOCK_BODY.vi;

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Article header */}
      <section className="pt-16 pb-12 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors"
              style={{ color: "var(--text-3)" }}
            >
              {t("backLink")}
            </Link>
          </FadeIn>
          <FadeIn delay={0.04}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ color: tag.color, backgroundColor: tag.bg }}>
                {tagLabel}
              </span>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>
                {new Date(article.publishedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : locale)}
              </span>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>
                · {article.readMinutes} {t("readMin")}
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight" style={{ color: "var(--text)" }}>
              {getTitle(article, locale)}
            </h1>
          </FadeIn>
          <FadeIn delay={0.14}>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              {getSummary(article, locale)}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Article body */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.08}>
            <div
              className="space-y-4"
              style={{ color: "var(--text-2)", lineHeight: "1.8", fontSize: "0.9375rem" }}
            >
              {body.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </FadeIn>

          {/* Related articles */}
          <FadeIn delay={0.2}>
            <div className="mt-16 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: "var(--text-3)" }}>
                {t("relatedTitle")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {NEWS_ARTICLES.filter((a) => a.slug !== slug)
                  .slice(0, 2)
                  .map((related) => {
                    const relTag = TAG_COLORS[related.tag] ?? TAG_COLORS.rate;
                    const relTagLabel = TAG_LABELS[related.tag]?.[locale] ?? "";
                    return (
                      <Link key={related.id} href={`/news/${related.slug}`}>
                        <div
                          className="p-4 rounded-xl border"
                          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                        >
                          <span className="text-xs px-1.5 py-0.5 rounded mb-2 inline-block" style={{ color: relTag.color, backgroundColor: relTag.bg }}>
                            {relTagLabel}
                          </span>
                          <p className="text-sm font-medium leading-snug" style={{ color: "var(--text)" }}>
                            {getTitle(related, locale)}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                            {new Date(related.publishedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : locale)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
