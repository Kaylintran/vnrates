"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/rates" as const, label: t("rates") },
    { href: "/black-market" as const, label: t("blackMarket") },
    { href: "/converter" as const, label: t("converter") },
    { href: "/news" as const, label: t("news") },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--green)" }}
          />
          <span
            className="font-semibold text-base tracking-tight"
            style={{ color: "var(--text)" }}
          >
            vnrates
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm transition-colors"
              style={{ color: "var(--text-2)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-2)")
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/rates"
            className="text-sm px-4 py-1.5 rounded-lg border transition-colors"
            style={{
              color: "var(--text)",
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--surface-2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--surface)";
            }}
          >
            {t("viewRates")}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1 transition-colors"
          style={{ color: "var(--text-2)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-b"
          style={{
            backgroundColor: "rgba(10,10,10,0.96)",
            backdropFilter: "blur(12px)",
            borderColor: "var(--border)",
          }}
        >
          <nav className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm py-2.5 border-b transition-colors"
                style={{ color: "var(--text-2)", borderColor: "var(--border)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex items-center justify-between">
              <LanguageSwitcher />
              <Link
                href="/rates"
                className="text-sm px-4 py-1.5 rounded-lg border"
                style={{
                  color: "var(--text)",
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {t("viewRates")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
