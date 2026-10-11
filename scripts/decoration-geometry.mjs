import sharp from "sharp";
import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";

/** Read PNG alpha only: original images, including their shadows, stay intact. */
export async function prepareDecorationGeometry(root, files) {
  const decorations = files.filter((file) => /^(oswiecenie|romantyzm|pozytywizm|mloda_polska)_assets\/.*\.png$/i.test(file) && !/\/1[234]-rama-/.test(file));
  const geometry = {};
  // Sequential decoding keeps peak memory low for the large transparent PNGs.
  for (const file of decorations) {
    const input = join(root, "img", file);
    const metadata = await sharp(input).metadata();
    const { data, info } = await sharp(input).ensureAlpha().resize({ width: 96 }).raw().toBuffer({ resolveWithObject: true });
    let left = info.width, top = info.height, right = 0, bottom = 0;
    const runs = [];
    for (let y = 0; y < info.height; y++) {
      let start = -1;
      for (let x = 0; x <= info.width; x++) {
        const solid = x < info.width && data[(y * info.width + x) * info.channels + info.channels - 1] >= 185;
        if (solid) {
          left = Math.min(left, x); top = Math.min(top, y);
          right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
          if (start < 0) start = x;
        } else if (start >= 0) {
          runs.push(`M${start},${y}h${x - start}v1h-${x - start}z`);
          start = -1;
        }
      }
    }
    if (!runs.length) throw new Error(`No opaque decoration pixels: ${file}`);
    geometry[file] = {
      width: info.width, height: info.height,
      intrinsicWidth: metadata.width, intrinsicHeight: metadata.height,
      bounds: { x: left, y: top, width: right - left, height: bottom - top },
      hitPath: runs.join(""),
    };
  }
  const path = join(root, "src", "data", "decoration-geometry.json");
  const content = JSON.stringify(geometry) + "\n";
  if (await readFile(path, "utf8").catch(() => null) !== content) await writeFile(path, content);
}
