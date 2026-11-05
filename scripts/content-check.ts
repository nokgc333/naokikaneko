import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { checkCollection, type Collection, type RawEntry } from "../src/lib/content/check";

const root = process.cwd();
const COLLECTIONS: Collection[] = ["work", "blog"];

function readEntries(collection: Collection): RawEntry[] {
  const dir = path.join(root, "content", collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => /\.mdx?$/.test(file) && !file.startsWith("dummy-"))
    .sort()
    .map((file) => ({ file, data: matter(fs.readFileSync(path.join(dir, file), "utf-8")).data }));
}

const fileExists = (publicPath: string) => fs.existsSync(path.join(root, "public", publicPath));

let total = 0;
let failures = 0;
for (const collection of COLLECTIONS) {
  const entries = readEntries(collection);
  const issues = checkCollection(collection, entries, fileExists);
  total += entries.length;
  failures += issues.length;
  for (const issue of issues) {
    console.error(`content/${collection}/${issue.file}: ${issue.message}`);
  }
}

if (failures > 0) {
  console.error(`\ncontent:check found ${failures} problem(s) in ${total} entries.`);
  process.exit(1);
}
console.log(`content:check passed (${total} entries).`);
