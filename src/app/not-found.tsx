import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground">お探しのページは見つかりませんでした。</p>
      <Link href="/" className="text-primary underline">
        トップに戻る
      </Link>
    </main>
  );
}
