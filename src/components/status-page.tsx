import type { ReactNode } from "react";

type StatusPageProps = {
  children: ReactNode;
};

export default function StatusPage({ children }: StatusPageProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col items-center justify-center gap-4 p-8 text-center">
      {children}
    </main>
  );
}
