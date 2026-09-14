import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { generateTokens } from "@repo/ui";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatbotLoader } from "@/components/chatbot-loader";
import { ConsentProvider } from "@/components/consent-provider";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { siteConfig } from "@/lib/site-data";

const inter = Inter({ subsets: ["latin"], display: "swap" });
import brand from "../../../brand.config";

import "./globals.css";

const brandCss = generateTokens(brand);
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} — ${brand.tagline ?? "Professional Services"}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    email: siteConfig.email || undefined,
    telephone: siteConfig.phone || undefined,
    image: `${siteUrl}/opengraph-image`,
    sameAs: siteConfig.socials.map((s) => s.href).filter(Boolean),
    address: siteConfig.location
      ? { "@type": "PostalAddress", streetAddress: siteConfig.location }
      : undefined,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandCss }} />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ConsentProvider>
          <ThemeProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 focus:shadow-lg focus:outline-none dark:focus:bg-slate-900 dark:focus:text-slate-50"
            >
              Skip to main content
            </a>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main id="main-content" className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <ChatbotLoader />
          </ThemeProvider>
          <Analytics />
          <AnalyticsScripts />
          <CookieConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
