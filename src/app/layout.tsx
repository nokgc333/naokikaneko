import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_JP, Roboto } from "next/font/google";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ContactWidget from "@/components/contact-widget";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "optional",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${roboto.variable} ${notoSansJP.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          lang="en"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <div
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-5 pt-20 pb-10 outline-none lg:px-10"
        >
          {children}
        </div>
        <SiteFooter />
        <ContactWidget />
      </body>
    </html>
  );
}
