import { getEntries } from "@/lib/content";
import WorkFilter from "@/components/work-filter";

export default function Home() {
  const entries = getEntries("work");

  return (
    <main className="mx-auto w-full max-w-5xl p-8">
      <h1 className="mb-7 text-3xl font-bold">Work</h1>
      <WorkFilter entries={entries} />
    </main>
  );
}
