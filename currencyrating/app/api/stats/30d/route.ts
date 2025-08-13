import { NextResponse } from "next/server";
import seed from "@/data/currencies.full.json";
import type { Currency } from "@/lib/data";

export const dynamic = "force-dynamic";

// Simple FX-based 30d change using exchangerate.host (no API key).
// Computes percent change vs USD over ~30 days for all known codes.
export async function GET() {
  try {
    const allCodes: string[] = Array.from(
      new Set((seed as unknown as Array<Pick<Currency, "code">>).map((x) => x.code).filter((c) => typeof c === "string"))
    );
    const codes = allCodes.filter((c) => c !== "USD");
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const startDt = new Date(today);
    startDt.setUTCDate(startDt.getUTCDate() - 31);
    const start = startDt.toISOString().slice(0, 10);

    // Chunk symbols to avoid URL length/provider limits
    const chunkSize = 20;
    const chunks: string[][] = [];
    for (let i = 0; i < codes.length; i += chunkSize) chunks.push(codes.slice(i, i + chunkSize));

    const changes: Record<string, number> = {};
    for (const chunk of chunks) {
      const url = `https://api.exchangerate.host/fluctuation?start_date=${start}&end_date=${end}&base=USD&symbols=${encodeURIComponent(
        chunk.join(",")
      )}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as { rates?: Record<string, { start_rate?: number; end_rate?: number }> };
      const rates: Record<string, { start_rate?: number; end_rate?: number }> = data.rates ?? {};
      for (const code of chunk) {
        const r = rates[code];
        const startRate = r?.start_rate;
        const endRate = r?.end_rate;
        if (typeof startRate === "number" && typeof endRate === "number" && startRate > 0) {
          const pct = ((endRate / startRate) - 1) * 100;
          changes[code] = Math.round(pct * 10) / 10;
        }
      }
    }

    // Fallback to Frankfurter (ECB daily) if no changes obtained
    if (Object.keys(changes).length === 0) {
      for (const chunk of chunks) {
        const url = `https://api.frankfurter.app/${start}..${end}?from=USD&to=${encodeURIComponent(chunk.join(","))}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const data = (await res.json()) as { rates?: Record<string, Record<string, number>> };
        const rates: Record<string, Record<string, number>> = data.rates ?? {};
        const dates = Object.keys(rates).sort();
        if (dates.length < 2) continue;
        const first = dates[0];
        const last = dates[dates.length - 1];
        for (const code of chunk) {
          const rFirst = rates[first]?.[code];
          const rLast = rates[last]?.[code];
          if (typeof rFirst === "number" && typeof rLast === "number" && rFirst > 0) {
            const pct = ((rLast / rFirst) - 1) * 100;
            changes[code] = Math.round(pct * 10) / 10;
          }
        }
      }
    }

    return NextResponse.json(
      { changes, date: end },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
