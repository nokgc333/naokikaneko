import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-8 py-24 sm:items-start">
        <Image src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
        <h1 className="text-3xl font-semibold">To get started, edit the page.tsx file.</h1>
        <p className="text-lg leading-8 text-zinc-600">
          Looking for a starting point or more instructions? Head over to{" "}
          <a href="https://vercel.com/templates?framework=next.js" className="font-medium text-zinc-950">
            Templates
          </a>{" "}
          or the{" "}
          <a href="https://nextjs.org/learn" className="font-medium text-zinc-950">
            Learning center
          </a>.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a href="https://vercel.com/new" className="rounded-full bg-black px-5 py-3 text-white">
            Deploy Now
          </a>
          <a href="https://nextjs.org/docs" className="rounded-full border px-5 py-3">
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
