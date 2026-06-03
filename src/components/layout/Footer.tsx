"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer
      className="border-t py-8"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--green)" }}
          />
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            vnrates
          </span>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            · {t("copy")}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-xs transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-2)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-3)")
            }
          >
            {t("about")}
          </Link>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            © {new Date().getFullYear()} Vnrates
          </span>
        </div>
      </div>
    </footer>
  );
}
