import type { CurrencyInfo } from "@/types";

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", dot: "#60a5fa", nameVi: "Đô la Mỹ" },
  { code: "EUR", dot: "#a78bfa", nameVi: "Euro" },
  { code: "JPY", dot: "#f87171", nameVi: "Yên Nhật" },
  { code: "KRW", dot: "#34d399", nameVi: "Won Hàn" },
  { code: "CNY", dot: "#fb923c", nameVi: "Nhân dân tệ" },
  { code: "GBP", dot: "#e879f9", nameVi: "Bảng Anh" },
  { code: "AUD", dot: "#facc15", nameVi: "Đô la Úc" },
  { code: "SGD", dot: "#22d3ee", nameVi: "Đô la Singapore" },
  { code: "HKD", dot: "#f43f5e", nameVi: "Đô la HK" },
  { code: "THB", dot: "#4ade80", nameVi: "Baht Thái" },
  { code: "CAD", dot: "#fb7185", nameVi: "Đô la Canada" },
  { code: "CHF", dot: "#93c5fd", nameVi: "Franc Thụy Sĩ" },
];

export const PRIORITY_CURRENCIES = ["USD", "EUR", "JPY", "KRW", "CNY", "GBP"];

export function getCurrencyInfo(code: string): CurrencyInfo | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

export const CONVERTER_RATES: Record<string, Partial<Record<string, number>>> = {
  USD: { VND: 25450, EUR: 0.918, JPY: 155.2, KRW: 1345, CNY: 7.25, GBP: 0.786, AUD: 1.532, SGD: 1.348 },
  EUR: { VND: 27950, USD: 1.089, JPY: 169.1, KRW: 1465, CNY: 7.90, GBP: 0.857, AUD: 1.668, SGD: 1.469 },
  JPY: { VND: 172.8, USD: 0.00644, EUR: 0.00591, KRW: 8.66, CNY: 0.0467, GBP: 0.00507, AUD: 0.00987, SGD: 0.00869 },
  KRW: { VND: 19.25, USD: 7.43e-4, EUR: 6.82e-4, JPY: 0.1154, CNY: 0.00539, GBP: 5.85e-4, AUD: 0.00114, SGD: 0.001004 },
  CNY: { VND: 3580, USD: 0.1379, EUR: 0.1266, JPY: 21.41, KRW: 185.5, GBP: 0.1085, AUD: 0.2114, SGD: 0.1861 },
  GBP: { VND: 32850, USD: 1.272, EUR: 1.167, JPY: 197.2, KRW: 1708, CNY: 9.22, AUD: 1.949, SGD: 1.715 },
  AUD: { VND: 16120, USD: 0.653, EUR: 0.599, JPY: 101.2, KRW: 876, CNY: 4.73, GBP: 0.513, SGD: 0.880 },
  SGD: { VND: 18740, USD: 0.741, EUR: 0.681, JPY: 115.0, KRW: 995, CNY: 5.37, GBP: 0.583, AUD: 1.136 },
  VND: { USD: 1 / 25450, EUR: 1 / 27950, JPY: 1 / 172.8, KRW: 1 / 19.25, CNY: 1 / 3580, GBP: 1 / 32850, AUD: 1 / 16120, SGD: 1 / 18740 },
};

export function getConverterRate(from: string, to: string): number | null {
  if (from === to) return 1;
  if (CONVERTER_RATES[from]?.[to]) return CONVERTER_RATES[from][to]!;
  if (CONVERTER_RATES[to]?.[from]) return 1 / CONVERTER_RATES[to][from]!;
  return null;
}
