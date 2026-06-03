import type { BankInfo } from "@/types";

export const BANKS: BankInfo[] = [
  { code: "VCB", name: "Vietcombank", shortName: "VCB", color: "#22c55e" },
  { code: "BIDV", name: "BIDV", shortName: "BIDV", color: "#3b82f6" },
  { code: "VTB", name: "Vietinbank", shortName: "VTB", color: "#f59e0b" },
  { code: "TCB", name: "Techcombank", shortName: "TCB", color: "#ef4444" },
  { code: "ACB", name: "ACB", shortName: "ACB", color: "#a78bfa" },
  { code: "MBB", name: "MB Bank", shortName: "MBB", color: "#34d399" },
  { code: "VPB", name: "VPBank", shortName: "VPB", color: "#fb923c" },
  { code: "TPB", name: "TPBank", shortName: "TPB", color: "#60a5fa" },
  { code: "STB", name: "Sacombank", shortName: "STB", color: "#f472b6" },
  { code: "EIB", name: "Eximbank", shortName: "EIB", color: "#4ade80" },
];

export function getBankByCode(code: string): BankInfo | undefined {
  return BANKS.find((b) => b.code === code);
}
