"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const CHIPS = ["All", "G10", "EM Asia", "LatAm", "Africa", "EMEA"] as const;
const REGION_TO_SLUG: Record<string, string> = {
  "G10": "g10",
  "EM Asia": "em-asia",
  "LatAm": "latam",
  "Africa": "africa",
  "EMEA": "emea",
};
const SLUG_TO_REGION: Record<string, string> = {
  "g10": "G10",
  "em-asia": "EM Asia",
  "latam": "LatAm",
  "africa": "Africa",
  "emea": "EMEA",
};

export default function RegionChips() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  let current = params.get("region") || "All";
  if (pathname.startsWith("/regions/")) {
    const slug = pathname.split("/").pop() || "";
    current = SLUG_TO_REGION[slug] || "All";
  }

  const setRegion = (r: string) => {
    if (r === "All") {
      router.push("/currencies");
    } else {
      const slug = REGION_TO_SLUG[r];
      if (slug) router.push(`/regions/${slug}`);
    }
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Region filters">
      {CHIPS.map((c) => (
        <button
          key={c}
          onClick={() => setRegion(c)}
          className={`px-2 py-1 rounded-full border text-xs ${
            current === c ? "bg-white/10" : "bg-transparent hover:bg-white/5"
          }`}
          aria-pressed={current === c}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
