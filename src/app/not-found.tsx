import type { Metadata } from "next";
import Link from "next/link";
import StatusPage from "@/components/status-page";

export const metadata: Metadata = {
  title: "404",
};

export default function NotFound() {
  return (
    <StatusPage>
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground">お探しのページは見つかりませんでした。</p>
      <Link href="/" className="text-primary underline">
        トップに戻る
      </Link>
    </StatusPage>
  );
}
