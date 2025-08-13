import React from "react";

const DRIVER_DEFS: Record<string, string> = {
  inflation: "Price stability and inflation performance",
  growth: "Real GDP growth momentum",
  debt_fiscal: "Debt sustainability and fiscal balance",
  external: "External balances and financing",
  reserves: "FX reserves adequacy",
  terms_of_trade: "Export/import price dynamics",
  policy: "Monetary and macro policy credibility",
  liquidity: "Market depth and turnover",
  political: "Governance and political risk",
};

export default function DriverBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3" title={DRIVER_DEFS[label] || label} aria-label={`${label} ${value}`}>
      <div className="w-32 text-xs text-[var(--cr-muted)] capitalize">{label.replace(/_/g, " ")}</div>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-[var(--cr-accent)]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <div className="w-10 text-right text-xs font-tabular">{value}</div>
    </div>
  );
}
