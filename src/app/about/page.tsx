import type { Metadata } from "next";
import { SiX, SiGithub, SiNote } from "react-icons/si";

export const metadata: Metadata = {
  title: "About",
  description: "Naoki Kaneko | Profile・Skill",
};

const snsLinks = [
  { label: "GitHub", href: "#", Icon: SiGithub },
  { label: "note", href: "#", Icon: SiNote, className: "scale-85" },
  { label: "X", href: "#", Icon: SiX, className: "scale-90" },
];

export default function About() {
  return (
    <main className="mx-auto w-full max-w-6xl p-8 lg:flex lg:min-h-[calc(100vh-5rem)] lg:items-center">
      <div className="flex w-full flex-col gap-8 lg:-translate-y-[20px]">
        <section>
          <h1 className="text-[32px] font-bold" lang="en">
            Naoki Kaneko / Engineer
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            金子 直樹 / エンジニア
          </p>
          <p className="mt-7 leading-relaxed">
            1997年生まれ。千葉県出身。東京都在住。
          </p>
          <p className="mt-3 leading-relaxed">
            銀行営業職の法人融資・金融商品担当として勤務後、オーストラリアでの海外就労経験を経てシステム開発職へ従事。
          </p>
          <p className="mt-3 leading-relaxed">
            Webアプリケーション開発を通じたユーザーの業務効率化支援や、3D制作ソフトツール開発を通じたクリエイターの制作効率化支援など、<br />幅広いアプローチによる課題解決を探求している。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold" lang="en">
            Skill, Tools
          </h2>
          <ul className="mt-6 list-disc space-y-1 pl-5">
            {["Skill A", "Skill B", "Skill C"].map((skill) => (
              <li key={skill} lang="en">
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold" lang="en">
            Certifications
          </h2>
          <ul className="mt-6 list-disc space-y-1 pl-5">
            {["Certification A", "Certification B", "Certification C"].map((certification) => (
              <li key={certification} lang="en">
                {certification}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold" lang="en">
            Contact
          </h2>
          <p className="mt-6">
            <a href="mailto:xxxyyyzzz@gmail.com">✉︎ xxxyyyzzz@gmail.com</a>
          </p>
          <div className="mt-6 flex gap-6">
            {snsLinks.map(({ label, href, Icon, className }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={`text-4xl ${className ?? ""}`}
              >
                <Icon />
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
