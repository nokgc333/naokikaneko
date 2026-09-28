import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_JP, Roboto } from "next/font/google";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ContactWidget from "@/components/contact-widget";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://naokikaneko.com"),
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
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex-1 pb-10 pt-20 px-5 lg:px-10">{children}</div>
        <SiteFooter />
        <ContactWidget />
      </body>
    </html>
  );
}
