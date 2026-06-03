"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";

const LOCALES = [
  { code: "vi", label: "VI" },
  { code: "ko", label: "KO" },
  { code: "zh-CN", label: "简" },
  { code: "zh-TW", label: "繁" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div className={`flex items-center gap-0.5 ${isPending ? "opacity-60" : ""}`} translate="no">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            locale === code
              ? "text-green bg-surface-2 font-medium"
              : "text-text-2 hover:text-text"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
