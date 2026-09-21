"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold">エラーが発生しました</h1>
      <p className="text-muted-foreground">
        時間をおいて再度お試しください。
        <br />
        問題が解決しない場合はお手数ですがお問い合わせください。
      </p>
    </main>
  );
}
