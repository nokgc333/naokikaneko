import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Profile and work",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <SiteHeader />
        <div className="px-5 pt-20 pb-8 lg:px-10 lg:pb-10">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
