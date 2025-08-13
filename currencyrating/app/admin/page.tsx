"use client";

import * as React from "react";
import { z } from "zod";
import type { Currency } from "@/lib/data";

const CurrencySchema: z.ZodType<Currency> = z.lazy(() => z.object({
  code: z.string(),
  name: z.string(),
  country: z.string(),
  region: z.string(),
  grade: z.string(),
  score: z.number(),
  score_change_30d: z.number(),
  score_change_90d: z.number(),
  signals: z.object({ fundamentals: z.string(), momentum: z.string(), liquidity: z.string() }),
  drivers: z.object({
    inflation: z.number(), growth: z.number(), debt_fiscal: z.number(), external: z.number(), reserves: z.number(), terms_of_trade: z.number(), policy: z.number(), liquidity: z.number(), political: z.number(),
  }),
  regime: z.string(),
  policy_rate: z.number(),
  reserves_usd_b: z.number().nullable(),
  current_account_gdp_pct: z.number(),
  notes: z.string(),
  last_updated: z.string(),
}));

const Schema = z.array(CurrencySchema);

export default function AdminPage() {
  const [ok, setOk] = React.useState(false);
  const [token, setToken] = React.useState<string>("");
  const [msg, setMsg] = React.useState<string>("");

  const onAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const token = (fd.get("password") || "").toString();
    if (token && token === process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      setOk(true);
      setToken(token);
    } else {
      setMsg("Invalid token");
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const parsed = Schema.parse(json);
      // Send to server to update dataset, compute 30d from history, and broadcast to clients
      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Upload failed (${res.status})`);
      }
      setMsg("Update broadcasted successfully.");
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  if (!ok) {
    return (
      <div className="mx-auto max-w-sm px-4 py-10">
        <h1 className="text-xl font-bold mb-4">Admin</h1>
        <form onSubmit={onAuth} className="space-y-3">
          <input name="password" type="password" placeholder="Token" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-[var(--cr-border)]" />
          <button className="cr-btn w-full">Continue</button>
          {msg && <div className="text-sm text-red-400">{msg}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10 space-y-4">
      <h1 className="text-xl font-bold">Upload JSON</h1>
      <input type="file" accept="application/json" onChange={onUpload} />
      {msg && <div className="text-sm text-red-400">{msg}</div>}
    </div>
  );
}
