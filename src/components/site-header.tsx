import Link from "next/link";
import { SiGithub } from "react-icons/si";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Work", href: "/" },
  { label: "Blog", href: "/blog" },
];

const snsLinks = [{ label: "GitHub", href: "https://github.com/nokgc333", Icon: SiGithub }];

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center gap-4 border-b border-border bg-background px-5 lg:gap-6 lg:px-10">
      <Link href="/about" className="text-lg font-bold tracking-wide whitespace-nowrap" lang="en">
        NAOKI KANEKO
      </Link>
      <nav className="flex gap-6">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm font-light" lang="en">
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto hidden items-center gap-6 text-[31.5px] lg:flex">
        {snsLinks.map(({ label, href, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <Icon aria-hidden="true" />
          </a>
        ))}
      </div>
    </header>
  );
}
