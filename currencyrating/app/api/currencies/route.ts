import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import seed from "@/data/currencies.full.json";
import { broadcast } from "@/lib/sse";
import type { Currency } from "@/lib/data";

// In-memory store (per server runtime). Suitable for dev/preview. Persist externally in production.
let dataset: Currency[] = seed as unknown as Currency[];
// Simple time-series history by currency code
const history = new Map<string, Array<{ date: string; score: number }>>();

// Initialize history from seed data
for (const c of dataset) {
  const arr = history.get(c.code) ?? [];
  if (c.last_updated && typeof c.score === "number") {
    arr.push({ date: c.last_updated, score: c.score });
  }
  history.set(c.code, uniqByDate(arr));
}

// Recompute initial 30d changes from history
dataset = dataset.map((c) => {
  if (c.last_updated && typeof c.score === "number") {
    return {
      ...c,
      score_change_30d: computeChange30d(c.code, c.last_updated, c.score),
    };
  }
  return c;
});

function uniqByDate(points: Array<{ date: string; score: number }>) {
  // Keep latest per day by date string, sorted ascending
  const map = new Map<string, { date: string; score: number }>();
  for (const p of points) map.set(p.date, p);
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function computeChange30d(code: string, latestDate: string, latestScore: number): number {
  const pts = history.get(code) ?? [];
  if (pts.length === 0) return 0;
  // Find point at or before (latestDate - 30 days)
  const baseDate = new Date(latestDate + "T00:00:00Z");
  baseDate.setUTCDate(baseDate.getUTCDate() - 30);
  const baseIso = baseDate.toISOString().slice(0, 10);
  let candidate = pts[0];
  for (const p of pts) {
    if (p.date <= baseIso) candidate = p;
    else break;
  }
  // If there is no earlier point, use the earliest available
  const base = candidate ?? pts[0];
  if (!base) return 0;
  return +(latestScore - base.score).toFixed(1);
}

export async function GET() {
  try {
    // Build symbol list from current dataset
    const codes: string[] = Array.from(new Set(dataset.map((x) => x.code))).filter(
      (c): c is string => typeof c === "string"
    );
    const others = codes.filter((c) => c !== "USD");
    const symbols = others.join(",");
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const startDt = new Date(today);
    startDt.setUTCDate(startDt.getUTCDate() - 31);
    const start = startDt.toISOString().slice(0, 10);

    const out = [...dataset];
    let merged = 0;

    // Primary: exchangerate.host timeseries
    try {
      const url = `https://api.exchangerate.host/timeseries?start_date=${start}&end_date=${end}&base=USD&symbols=${encodeURIComponent(symbols)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const j = (await res.json()) as { rates?: Record<string, Record<string, number>> };
        const rates: Record<string, Record<string, number>> = j.rates ?? {};
        const dates = Object.keys(rates).sort();
        if (dates.length >= 2) {
          const first = dates[0];
          const last = dates[dates.length - 1];
          const changes = new Map<string, number>();
          for (const code of codes) {
            if (code === "USD") { changes.set(code, 0); continue; }
            const rFirst = rates[first]?.[code];
            const rLast = rates[last]?.[code];
            if (typeof rFirst === "number" && typeof rLast === "number" && rFirst > 0) {
              const pct = ((rLast / rFirst) - 1) * 100;
              changes.set(code, Math.round(pct * 10) / 10);
            }
          }
          // Merge changes into dataset copy
          for (let i = 0; i < out.length; i++) {
            const code = out[i].code;
            const v = changes.get(code);
            if (typeof v === "number") {
              out[i] = { ...out[i], score_change_30d: v, last_updated: last } as Currency;
              merged++;
            }
          }
        }
      }
    } catch {}

    // Fallback: Frankfurter (ECB daily) in chunks if nothing merged
    if (merged === 0) {
      const chunkSize = 20;
      const chunks: string[][] = [];
      for (let i = 0; i < others.length; i += chunkSize) chunks.push(others.slice(i, i + chunkSize));
      for (const chunk of chunks) {
        try {
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
              const v = Math.round(pct * 10) / 10;
              for (let i = 0; i < out.length; i++) {
                if (out[i].code === code) {
                  out[i] = { ...out[i], score_change_30d: v, last_updated: last } as Currency;
                  merged++;
                  break;
                }
              }
            }
          }
        } catch {}
      }
    }

    return NextResponse.json(out, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch {
    // Fallback to in-memory dataset if provider fails
    return NextResponse.json(dataset, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }
}

export async function POST(req: NextRequest) {
  // Basic token check (dev/demo): client sends x-admin-token header
  const token = req.headers.get("x-admin-token") || "";
  if (!process.env.NEXT_PUBLIC_ADMIN_TOKEN || token !== process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of currency objects" }, { status: 400 });
    }
    // Index current dataset by code for efficient updates
    const byCode = new Map<string, Currency>(dataset.map((c) => [c.code, c]));
    for (const incoming of body as Currency[]) {
      if (!incoming || typeof incoming.code !== "string") continue;
      const prev = byCode.get(incoming.code);
      const merged: Currency = prev ? { ...prev, ...incoming } : { ...incoming };
      // Update history with latest
      if (merged.last_updated && typeof merged.score === "number") {
        const arr = history.get(merged.code) ?? [];
        arr.push({ date: merged.last_updated, score: merged.score });
        history.set(merged.code, uniqByDate(arr));
        // Determine 30d change: prefer incoming provided value; otherwise compute from history
        if (typeof incoming.score_change_30d === "number") {
          merged.score_change_30d = incoming.score_change_30d;
        } else {
          merged.score_change_30d = computeChange30d(merged.code, merged.last_updated, merged.score);
        }
      }
      byCode.set(merged.code, merged);
    }
    dataset = Array.from(byCode.values());

    // Notify all clients via SSE
    try {
      broadcast({ type: "currencies:update", at: Date.now() });
    } catch {}

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid JSON";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
