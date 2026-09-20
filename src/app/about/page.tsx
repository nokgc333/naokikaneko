import { SiX, SiGithub, SiInstagram } from "react-icons/si";

const snsLinks = [
  { label: "GitHub", href: "#", Icon: SiGithub },
  { label: "X", href: "#", Icon: SiX },
  { label: "Instagram", href: "#", Icon: SiInstagram },
];

export default function About() {
  return (
    <main>
      <section>
        <h1 lang="en">Naoki Kaneko / Engineer</h1>
        <p>金子 直樹 / エンジニア</p>
        <p>
          （仮）自己紹介文。Lorem ipsum dolor sit, amet consectetur adipisicing elit. Maiores consequatur, aperiam nam dolorem quaerat odio autem maxime placeat molestiae dolorum. In repellendus repellat laborum quasi, est minima laudantium qui! Reiciendis.
        </p>
      </section>

      <section>
        <h2 lang="en">Skill, Tools</h2>
        <ul>
          {["Skill A", "Skill B", "Skill C"].map((skill) => (
            <li key={skill} lang="en">
              {skill}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 lang="en">SNS</h2>
        <div>
          {snsLinks.map(({ label, href, Icon }) => (
            <a key={label} href={href} aria-label={label}>
              <Icon />
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 lang="en">Contact</h2>
      </section>
    </main>
  );
}
