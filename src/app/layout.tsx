import type { Metadata, Viewport } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ContactWidget from "@/components/contact-widget";
import JsonLd from "@/components/json-ld";
import { buildPersonJsonLd, buildWebSiteJsonLd } from "@/lib/seo/structured-data";
import { SITE_URL } from "@/lib/seo/site";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "naokikaneko.com",
    template: "%s | naokikaneko.com",
  },
  description: "Naoki Kaneko | Portfolio Website",
  openGraph: {
    siteName: "naokikaneko.com",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <a
          href="#main-content"
          lang="en"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <div id="main-content" tabIndex={-1} className="px-5 pt-20 pb-8 lg:px-10 lg:pb-10">
          {children}
        </div>
        <SiteFooter />
        <ContactWidget />
        <JsonLd data={buildWebSiteJsonLd()} />
        <JsonLd data={buildPersonJsonLd()} />
      </body>
    </html>
  );
}
