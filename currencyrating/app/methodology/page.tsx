import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Methodology",
  description: `How ${SITE.name} builds currency ratings and scores.`,
  alternates: { canonical: "/methodology" },
  openGraph: {
    title: `Methodology — ${SITE.name}`,
    description: `How ${SITE.name} builds currency ratings and scores.`,
    url: "/methodology",
    siteName: SITE.name,
    type: "website",
  },
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Methodology</h1>
      <section>
        <h2 className="font-semibold mb-2">Rating formula</h2>
        <p className="text-[var(--cr-muted)]">Simple composite score (0–100) mapped to letter grades with transparent thresholds.</p>
      </section>
      <section>
        <h2 className="font-semibold mb-2">Driver weights</h2>
        <p className="text-[var(--cr-muted)]">inflation (15), growth (10), debt_fiscal (15), external (10), reserves (10), terms_of_trade (10), policy (10), liquidity (10), political (10). Sum = 100.</p>
      </section>
      <section>
        <h2 className="font-semibold mb-2">Update cadence</h2>
        <p className="text-[var(--cr-muted)]">Scores update as new data arrives; change logs summarize material updates.</p>
      </section>
      <section>
        <h2 className="font-semibold mb-2">Limitations</h2>
        <p className="text-[var(--cr-muted)]">Indicative only. Not investment advice. Data may be delayed or estimated.</p>
      </section>
      <section>
        <h2 className="font-semibold mb-2">Change log</h2>
        <ul className="list-disc pl-6 text-[var(--cr-muted)]">
          <li>Initial MVP release.</li>
        </ul>
      </section>
    </div>
  );
}
