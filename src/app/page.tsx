import Image from "next/image";
import Link from "next/link";
import { getEntries } from "@/lib/content";

export default function Home() {
  const entries = getEntries("work");

  return (
    <main>
      <h1>Work</h1>
      <div>
        {entries.map((entry) => (
          <Link key={entry.slug} href={`/work/${entry.slug}`}>
            <Image
              src={entry.thumbnail ?? "/images/placeholder.svg"}
              alt={entry.title}
              width={400}
              height={225}
            />
            <div>
              <h3>{entry.title}</h3>
              <p>{entry.description}</p>
              <div>
                <time>{entry.date}</time>
                {entry.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
