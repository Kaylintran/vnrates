export interface ExchangeRate {
  bankCode: string;
  bankName: string;
  currency: string;
  buyRate: number | null;
  sellRate: number | null;
  transferRate: number | null;
  updatedAt: string;
  date: string;
}

export interface BlackMarketRate {
  currency: string;
  buyRate: number;
  sellRate: number;
  source: string;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  titleVi: string;
  titleKo: string;
  titleZhCN: string;
  titleZhTW: string;
  summaryVi: string;
  summaryKo: string;
  summaryZhCN: string;
  summaryZhTW: string;
  tag: "rate" | "bank" | "analysis";
  publishedAt: string;
  readMinutes: number;
  trend: "up" | "down" | "neutral";
  trendData: number[];
}

export type SupportedLocale = "vi" | "ko" | "zh-CN" | "zh-TW";

export interface BankInfo {
  code: string;
  name: string;
  shortName: string;
  color: string;
}

export interface CurrencyInfo {
  code: string;
  dot: string;
  nameVi: string;
}
