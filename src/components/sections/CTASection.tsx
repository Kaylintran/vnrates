"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";

export default function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="py-16 md:py-40 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(34,197,94,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
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
            className="mt-4 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {t("title1")}
            <br />
            <span style={{ color: "var(--green)" }}>{t("title2")}</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p
            className="mt-5 text-base max-w-lg mx-auto"
            style={{ color: "var(--text-2)" }}
          >
            {t("desc")}
          </p>
        </FadeIn>
        <FadeIn delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/rates"
              className="inline-flex items-center px-8 py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: "var(--green)", color: "#000" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.88")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
              }
            >
              {t("cta1")}
            </Link>
            <Link
              href="/converter"
              className="inline-flex items-center px-8 py-3.5 rounded-xl text-sm font-medium border transition-all"
              style={{
                color: "var(--text)",
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  "var(--surface)";
              }}
            >
              {t("cta2")}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
