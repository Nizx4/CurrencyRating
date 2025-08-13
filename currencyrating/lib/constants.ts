export const COLORS = {
  bg: "#0B1220",
  surface: "#0F172A",
  card: "#111827",
  text: "#E5E7EB",
  muted: "#94A3B8",
  accent: "#38BDF8",
  success: "#34D399",
  danger: "#F87171",
  border: "#1F2937",
};

export const HEATMAP_COLORS = {
  low: "#8B5CF6",
  mid: "#F59E0B",
  high: "#22C55E",
};

export const DRIVER_WEIGHTS: Record<string, number> = {
  inflation: 15,
  growth: 10,
  debt_fiscal: 15,
  external: 10,
  reserves: 10,
  terms_of_trade: 10,
  policy: 10,
  liquidity: 10,
  political: 10,
};

export const REGIONS = [
  "All",
  "G10",
  "EM Asia",
  "LatAm",
  "Africa",
  "EMEA",
  "Europe",
  "Asia",
  "North America",
];

export const SITE = {
  name: "CurrencyRating",
  url: "https://currencyrating.com",
  description:
    "Letter grades and a 0–100 score you can actually explain.",
};
