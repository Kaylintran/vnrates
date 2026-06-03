"use client";

import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";

const PILL_KEYS = [
  "pill1",
  "pill2",
  "pill3",
  "pill4",
  "pill5",
  "pill6",
] as const;

export default function IntroSection() {
  const t = useTranslations("intro");

  return (
    <section className="py-16 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
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
              className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight leading-tight"
              style={{ color: "var(--text)" }}
            >
              {t("title1")}
              <br />
              <span style={{ color: "var(--green)" }}>{t("title2")}</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p
              className="mt-4 text-base leading-relaxed"
              style={{ color: "var(--text-2)" }}
            >
              {t("desc")}
            </p>
          </FadeIn>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          {PILL_KEYS.map((key, i) => (
            <FadeIn key={key} delay={0.08 * i}>
              <span
                className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border"
                style={{
                  color: "var(--text-2)",
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--green)" }}
                />
                {t(key)}
              </span>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
