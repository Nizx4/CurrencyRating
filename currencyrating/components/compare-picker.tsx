"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loadCurrencies } from "@/lib/data";

export default function ComparePicker({ base }: { base?: string }) {
  const [codes, setCodes] = React.useState<string[]>([]);
  const [sel, setSel] = React.useState<string>("");
  const router = useRouter();
  React.useEffect(() => {
    loadCurrencies().then((d) => setCodes(d.map((x) => x.code)));
  }, []);
  const onAdd = () => {
    if (!sel) return;
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const existing = (params.get("codes") || (base ? base : "")).split(",").filter(Boolean);
    const next = Array.from(new Set([...existing, sel])).slice(0, 3);
    router.push(`/compare?codes=${next.join(",")}`);
  };
  return (
    <div className="flex items-center gap-2">
      <input
        list="codes"
        value={sel}
        onChange={(e) => setSel(e.target.value.toUpperCase())}
        onKeyDown={(e) => {
          if (e.key === "Enter") onAdd();
        }}
        placeholder="Add code…"
        aria-label="Add currency code to compare"
        className="px-3 py-2 rounded-lg bg-white/5 border border-[var(--cr-border)] text-sm"
      />
      <datalist id="codes">
        {codes.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <button onClick={onAdd} className="cr-btn text-sm" aria-label="Add code and open compare">Compare</button>
    </div>
  );
}
