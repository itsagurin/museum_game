import { mkdir, copyFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, "public", "art");
await mkdir(output, { recursive: true });
await mkdir(join(root, "src", "data"), { recursive: true });
const files = (await readdir(join(root, "img"))).filter((name) =>
  /\.(jpg|jpeg|png|webp)$/i.test(name),
);
await Promise.all(
  files.map((name) => copyFile(join(root, "img", name), join(output, name))),
);
await writeFile(
  join(root, "src", "data", "asset-manifest.json"),
  JSON.stringify(files, null, 2) + "\n",
);
