"use client";

import * as React from "react";
import { Currency, replaceDataset } from "@/lib/data";

/**
 * Hooks up client-side polling to refresh the in-memory currency dataset.
 * Dispatches a window event "currencies:updated" whenever fresh data arrives.
 */
export function useLiveCurrencies(intervalMs = 60_000) {
  React.useEffect(() => {
    let disposed = false;
    // Ensure we only start one global polling loop and one SSE connection regardless of how many components call this hook
    const w = window as unknown as { __CR_LIVE_STARTED?: boolean; __CR_SSE_STARTED?: boolean; __CR_SSE?: EventSource };

    async function fetchNow() {
      try {
        const res = await fetch("/api/currencies", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as unknown;
        if (disposed) return;
        if (Array.isArray(json)) {
          replaceDataset(json as Currency[]);
          window.dispatchEvent(new Event("currencies:updated"));
        }
      } catch {
        // Silently ignore network errors for now; could add toast/logging
        // console.error("Failed to fetch currencies:", err);
      }
    }

    // Connect to SSE for immediate push notifications (singleton)
    if (!w.__CR_SSE_STARTED) {
      w.__CR_SSE_STARTED = true;
      try {
        const es = new EventSource("/api/stream");
        w.__CR_SSE = es;
        es.onmessage = () => {
          // A server event indicates data changed; refetch immediately
          fetchNow();
        };
        es.onerror = () => {
          // Let browser auto-reconnect (server sets retry). Polling remains as fallback.
        };
      } catch {
        // If EventSource fails (older browsers), polling still keeps us updated.
      }
    }

    // Initial fetch and start polling (singleton)
    if (!w.__CR_LIVE_STARTED) {
      w.__CR_LIVE_STARTED = true;
      fetchNow();
      window.setInterval(fetchNow, Math.max(10_000, intervalMs));
    }

    return () => {
      disposed = true;
      // We intentionally keep the singleton interval running to keep the app fresh
      // If needed, we could implement a ref-count to stop it when unused.
    };
  }, [intervalMs]);
}
