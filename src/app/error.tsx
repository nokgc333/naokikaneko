"use client";

import { useEffect } from "react";
import StatusPage from "@/components/status-page";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage>
      <h1 className="text-3xl font-bold">エラーが発生しました</h1>
      <p className="text-muted-foreground">
        時間をおいて再度お試しください。
        <br />
        問題が解決しない場合はお手数ですがお問い合わせください。
      </p>
    </StatusPage>
  );
}
