import Link from "next/link";
import { SiGithub } from "react-icons/si";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Work", href: "/" },
  { label: "Blog", href: "/blog" },
];

const snsLinks = [
  { label: "GitHub", href: "#", Icon: SiGithub },
];

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center gap-6 border-b border-border bg-background px-10">
      <Link href="/about" className="text-lg font-bold tracking-wide" lang="en">
        NAOKI KANEKO
      </Link>
      <nav className="flex gap-6">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm font-medium" lang="en">
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-4">
        {snsLinks.map(({ label, href, Icon }) => (
          <a key={label} href={href} aria-label={label} className="text-[31.5px]">
            <Icon />
          </a>
        ))}
      </div>
    </header>
  );
}
