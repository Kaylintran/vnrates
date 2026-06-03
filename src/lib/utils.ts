export function fmt(n: number, currency: string): string {
  if (currency === "VND" || currency === "KRW") {
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  if (currency === "JPY") {
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function fmtRate(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n > 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function today(): string {
  return new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
