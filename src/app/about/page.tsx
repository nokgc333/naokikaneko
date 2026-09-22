import type { Metadata } from "next";
import { SiX, SiGithub, SiInstagram } from "react-icons/si";

export const metadata: Metadata = {
  title: "About",
  description: "Naoki Kaneko | Profile・Skill",
};

const snsLinks = [
  { label: "GitHub", href: "#", Icon: SiGithub },
  { label: "X", href: "#", Icon: SiX },
  { label: "Instagram", href: "#", Icon: SiInstagram },
];

export default function About() {
  return (
    <main className="mx-auto w-full max-w-5xl p-8 lg:flex lg:min-h-[calc(100vh-5rem)] lg:items-center">
      <div className="flex w-full flex-col gap-16 lg:-translate-y-[80px]">
        <section>
          <h1 className="text-[32px] font-bold" lang="en">
            Naoki Kaneko / Engineer
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            金子 直樹 / エンジニア
          </p>
          <p className="mt-8 leading-relaxed">
            （仮）自己紹介文。Lorem ipsum dolor sit, amet consectetur adipisicing elit. Maiores consequatur, aperiam nam dolorem quaerat odio autem maxime placeat molestiae dolorum. In repellendus repellat laborum quasi, est minima laudantium qui! Reiciendis.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold" lang="en">
            Skill, Tools
          </h2>
          <ul className="mt-7 list-disc space-y-1 pl-5">
            {["Skill A", "Skill B", "Skill C"].map((skill) => (
              <li key={skill} lang="en">
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold" lang="en">
            SNS
          </h2>
          <div className="mt-7 flex gap-6">
            {snsLinks.map(({ label, href, Icon }) => (
              <a key={label} href={href} aria-label={label} className="text-4xl">
                <Icon />
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold" lang="en">
            Contact
          </h2>
          <p className="mt-7">
            <a href="mailto:xxxyyyzzz@gmail.com">xxxyyyzzz@gmail.com</a>
          </p>
        </section>
      </div>
    </main>
  );
}
