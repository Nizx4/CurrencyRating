import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE.name}. ${SITE.description}`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About — ${SITE.name}`,
    description: `About ${SITE.name}. ${SITE.description}`,
    url: "/about",
    siteName: SITE.name,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">About</h1>
      <p className="text-[var(--cr-muted)]">Our mission is to provide a clear, explainable rating for every currency. What ratings are: a concise view of fundamentals, momentum, and liquidity. What ratings are not: investment advice.</p>
      <p><a className="underline" href="mailto:hello@currencyrating.com">Contact us</a></p>
    </div>
  );
}
