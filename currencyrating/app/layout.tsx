import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — Currency ratings and scores`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL("https://currencyrating.com"),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-text`}>
        <ThemeProvider>
          <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 cr-btn">
            Skip to content
          </a>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main id="content" className="min-h-[70vh]">
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
