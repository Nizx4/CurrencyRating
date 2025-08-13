import data from "@/data/currencies.full.json";

export type Signals = {
  fundamentals: string;
  momentum: string;
  liquidity: string;
};

export type Drivers = {
  inflation: number;
  growth: number;
  debt_fiscal: number;
  external: number;
  reserves: number;
  terms_of_trade: number;
  policy: number;
  liquidity: number;
  political: number;
};

export type Currency = {
  code: string;
  name: string;
  country: string;
  region: string;
  grade: string;
  score: number;
  score_change_30d: number;
  score_change_90d: number;
  signals: Signals;
  drivers: Drivers;
  regime: string;
  policy_rate: number;
  reserves_usd_b: number | null;
  current_account_gdp_pct: number;
  notes: string;
  last_updated: string; // YYYY-MM-DD
};

let dataset: Currency[] = data as unknown as Currency[];

// Composite groups mapping. A group may expand to specific currency codes and/or underlying region labels.
// This enables URLs like "/regions/g10" to resolve to multiple currencies.
const GROUPS: Record<string, { codes?: string[]; regions?: string[] }> = {
  // G10 majors
  "G10": {
    codes: ["USD", "EUR", "JPY", "GBP", "AUD", "NZD", "CAD", "CHF", "SEK", "NOK"],
  },
  // Emerging Asia basket
  "EM Asia": {
    codes: ["CNY", "INR", "IDR", "KRW", "TWD", "THB", "PHP", "MYR", "VND"],
  },
  // EMEA aggregates Europe and Africa regions
  "EMEA": {
    regions: ["Europe", "Africa"],
  },
};

export async function loadCurrencies(): Promise<Currency[]> {
  return dataset;
}

export function replaceDataset(newData: Currency[]) {
  dataset = newData;
}

export function filterCurrencies(opts: {
  regions?: string[];
  gradeMin?: string;
  gradeMax?: string;
  regime?: string[];
  dev?: ("EM" | "DM")[];
} = {}): Currency[] {
  const { regions, gradeMin, gradeMax, regime } = opts;

  // Expand requested regions into explicit region labels and currency codes using GROUPS
  const requested = regions ?? [];
  const allowedRegions = new Set<string>();
  const allowedCodes = new Set<string>();
  if (requested.length > 0) {
    for (const r of requested) {
      const group = GROUPS[r];
      // Always allow the literal region name in case it's a direct match
      allowedRegions.add(r);
      if (group?.regions) group.regions.forEach((x) => allowedRegions.add(x));
      if (group?.codes) group.codes.forEach((x) => allowedCodes.add(x));
    }
  }

  return dataset.filter((c) => {
    const inRegion = requested.length === 0 || allowedRegions.has(c.region) || allowedCodes.has(c.code);
    const inRegime = !regime || regime.length === 0 || regime.includes(c.regime);
    // Grade filter: map to ordinal by score thresholds using a helper mapping table
    const gradeOrder = [
      "D",
      "CC",
      "CCC",
      "B-",
      "B",
      "B+",
      "BB-",
      "BB",
      "BB+",
      "BBB-",
      "BBB",
      "BBB+",
      "A-",
      "A",
      "A+",
      "AA-",
      "AA",
      "AA+",
      "AAA",
    ];
    const idx = (g: string) => gradeOrder.indexOf(g.toUpperCase());
    const inGrade = (!gradeMin || idx(c.grade) >= idx(gradeMin)) && (!gradeMax || idx(c.grade) <= idx(gradeMax));
    return inRegion && inRegime && inGrade;
  });
}

export function topMovers(window: "30d" | "90d", limit = 5): Currency[] {
  const key = window === "30d" ? "score_change_30d" : "score_change_90d";
  return [...dataset]
    .sort((a, b) => Math.abs(b[key]) - Math.abs(a[key]))
    .slice(0, limit);
}

export function mostStable(window: "30d" | "90d" = "90d", limit = 5): Currency[] {
  const key = window === "30d" ? "score_change_30d" : "score_change_90d";
  return [...dataset]
    .sort((a, b) => Math.abs(a[key]) - Math.abs(b[key]))
    .slice(0, limit);
}

export function toCSV(rows: Currency[]): string {
  const headers = [
    "code",
    "name",
    "country",
    "region",
    "grade",
    "score",
    "score_change_30d",
    "score_change_90d",
    "regime",
    "policy_rate",
    "reserves_usd_b",
    "current_account_gdp_pct",
    "last_updated",
  ];
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v as never);
    if (s.includes(",") || s.includes("\n")) return '"' + s.replaceAll('"', '""') + '"';
    return s;
  };
  const headerLine = headers.join(",");
  const lines = rows.map((r) =>
    [
      r.code,
      r.name,
      r.country,
      r.region,
      r.grade,
      r.score,
      r.score_change_30d,
      r.score_change_90d,
      r.regime,
      r.policy_rate,
      r.reserves_usd_b ?? "",
      r.current_account_gdp_pct,
      r.last_updated,
    ]
      .map(escape)
      .join(",")
  );
  return [headerLine, ...lines].join("\n");
}
