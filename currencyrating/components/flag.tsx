"use client";

import * as React from "react";

type Props = {
  code: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

// Map currency codes to ISO 3166-1 alpha-2 country/region codes for flag CDNs
// Covers all currencies currently present in `data/currencies.full.json`
const CODE_TO_ISO: Record<string, string> = {
  USD: "us",
  EUR: "eu", // Use EU flag for Euro area
  JPY: "jp",
  GBP: "gb",
  AUD: "au",
  NZD: "nz",
  CAD: "ca",
  CHF: "ch",
  SEK: "se",
  NOK: "no",
  MXN: "mx",
  BRL: "br",
  CLP: "cl",
  COP: "co",
  PEN: "pe",
  ARS: "ar",
  INR: "in",
  CNY: "cn",
  KRW: "kr",
  TWD: "tw",
  THB: "th",
  PHP: "ph",
  MYR: "my",
  IDR: "id",
  VND: "vn",
  ZAR: "za",
  NGN: "ng",
  EGP: "eg",
  KES: "ke",
  GHS: "gh",
  DOP: "do",
  JMD: "jm",
  GTQ: "gt",
};

export default function Flag({ code, alt, width = 24, height = 16, className = "h-4 w-6 rounded-sm border border-black/20" }: Props) {
  const label = alt ?? `Flag of ${code}`;
  const [idx, setIdx] = React.useState(0);

  // Reset source attempt when the code changes
  React.useEffect(() => {
    setIdx(0);
  }, [code]);

  const iso = CODE_TO_ISO[code.toUpperCase()];
  const candidates = [
    `/flags/${code}.svg`,
    ...(iso ? [`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${iso}.svg`] : []),
    "/flags/_placeholder.svg",
  ];
  const src = candidates[Math.min(idx, candidates.length - 1)];

  return (
    <img
      src={src}
      alt={label}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setIdx((i) => (i < candidates.length - 1 ? i + 1 : i))}
    />
  );
}
