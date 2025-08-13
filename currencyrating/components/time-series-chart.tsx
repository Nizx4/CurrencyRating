"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function makeSeries(score: number, change30: number, range: "3m" | "1y" | "3y") {
  const points = range === "3m" ? 13 : range === "1y" ? 52 : 156;
  const arr = Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * 0.4;
    const drift = (change30 || 0) * (range === "3m" ? t : t / 4);
    return Math.max(0, Math.min(100, score + noise + drift - (change30 || 0)));
  });
  return arr.map((v, i) => ({ i, value: Number(v.toFixed(2)) }));
}

export default function TimeSeriesChart({ score, change30, range = "3m" }: { score: number; change30: number; range?: "3m" | "1y" | "3y" }) {
  const data = React.useMemo(() => makeSeries(score, change30, range), [score, change30, range]);
  const ariaLabel = React.useMemo(() => {
    const change = `${change30 > 0 ? "+" : ""}${change30.toFixed(1)}`;
    const span = range === "3m" ? "3 months" : range === "1y" ? "1 year" : "3 years";
    return `Score over time chart for ${span}. Current score ${score.toFixed(1)}; 30 day change ${change}.`;
  }, [score, change30, range]);
  return (
    <div className="cr-card p-4">
      <div className="text-sm text-[var(--cr-muted)] mb-2">Score over time</div>
      <div className="h-56" role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8" }} width={28} />
            <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1F2937" }} />
            <Area type="monotone" dataKey="value" stroke="#38BDF8" fill="url(#grad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
