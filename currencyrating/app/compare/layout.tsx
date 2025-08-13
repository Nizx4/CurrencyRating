import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Compare",
  description: `Compare up to three currencies by rating, score, and drivers on ${SITE.name}.`,
  alternates: { canonical: "/compare" },
  openGraph: {
    title: `Compare — ${SITE.name}`,
    description: `Compare up to three currencies by rating, score, and drivers on ${SITE.name}.`,
    url: "/compare",
    siteName: SITE.name,
    type: "website",
  },
};

export default function CompareLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
