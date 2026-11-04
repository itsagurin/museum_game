import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import subsetFont from "subset-font";

export const fontTextSources = ["src/data/copy.ts", "src/data/coloring-copy.ts", "src/data/eras.ts", "content/artworks.json"];

/** Keep only Latin/Latin Extended WOFF2, including the upstream unicode ranges. */
export async function prepareFonts(root) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const faces = [];
  const files = new Set();
  const text = (await Promise.all(fontTextSources.map(file => readFile(join(root, file), "utf8")))).join("\n");
  await mkdir(join(root, "public/fonts"), { recursive: true });
  for (const [family, weights] of [["dm-sans", [400, 500, 600]], ["cormorant-garamond", [500, 600]]]) {
    const directory = join(root, "node_modules/@fontsource", family);
    await copyFile(join(directory, "LICENSE"), join(root, "public/fonts", `${family}-OFL.txt`));
    for (const weight of weights) {
      const upstream = await readFile(join(directory, `${weight}.css`), "utf8");
      for (const subset of ["latin", "latin-ext"]) {
        const file = `${family}-${subset}-${weight}-normal.woff2`;
        const face = upstream.match(/@font-face\s*\{[^}]+\}/g).find(face => face.includes(`/${file}`));
        if (!face) throw new Error(`Missing font face: ${file}`);
        files.add(file);
        const source = join(directory, "files", file), target = join(root, "public/fonts", file);
        if (weight === 600) {
          // Only this read-only UI weight is reduced; input names and other weights keep the full glyph set.
          const buffer = await subsetFont(await readFile(source), text, { targetFormat: "woff2", preserveNameIds: [0, 1, 2, 3, 4, 5, 6, 13, 14] });
          await writeFile(target, buffer);
        } else await copyFile(source, target);
        faces.push(face.replace(/src:[^;]+;/, `src: url("${base}/fonts/${file}") format("woff2");`));
      }
    }
  }
  for (const file of await readdir(join(root, "public/fonts"))) if (file.endsWith(".woff2") && !files.has(file)) await rm(join(root, "public/fonts", file));
  const css = faces.join("\n") + "\n";
  const target = join(root, "src/app/fonts-generated.css");
  if (await readFile(target, "utf8").catch(() => null) !== css) await writeFile(target, css);
}
