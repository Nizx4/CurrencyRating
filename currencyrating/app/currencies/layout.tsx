import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "All Currencies",
  description: SITE.description,
  alternates: { canonical: "/currencies" },
  openGraph: {
    title: `All Currencies — ${SITE.name}`,
    description: SITE.description,
    url: "/currencies",
    siteName: SITE.name,
    type: "website",
  },
};

export default function CurrenciesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
