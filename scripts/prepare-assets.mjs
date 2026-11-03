import { mkdir, copyFile, readdir, readFile, rm, rmdir, stat, writeFile } from "node:fs/promises";
import { watch } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { prepareDecorationGeometry } from "./decoration-geometry.mjs";

// Only files the game references are published; everything else in img/ stays source material.
const publishedAssets = [
  /^(house\d|hall\d?|room\d|blank_paper_crossmark)\.(jpe?g|png|webp)$/i,
  /^era\d_(?![a-z_]*_kolorowanie\/)[a-z_]+\/[^/]+\.(jpe?g|png|webp)$/i,
  /^era\d_[a-z_]+_kolorowanie\/json\/[^/]+\.json$/i,
  /^era\d_[a-z_]+_kolorowanie\/previews\/[^/]+_art\.png$/i,
  /^(oswiecenie|romantyzm|pozytywizm|mloda_polska)_assets\/(?!1[234]-rama-)[^/]+\.png$/i,
];
const isReproduction = (name) => /^era\d_(?![a-z_]*_kolorowanie\/)[a-z_]+\/[^/]+$/i.test(name);
const isDecoration = (name) => /_assets\/[^/]+\.png$/i.test(name);
// Bump when encoder settings change so cached outputs are rebuilt.
const PIPELINE_VERSION = 1;
const CACHE_FILE = ".prepared.json";
const THUMBS_DIR = "_thumbs";

export const thumbnailPath = (name) => `${THUMBS_DIR}/${name.replace(/\.[^/.]+$/, "")}.webp`;

function encoder(name) {
  // Reproductions stay sharp in the full-screen reveal; decorations never exceed a third of the scene.
  const maxSize = isReproduction(name) ? 1600 : isDecoration(name) ? 768 : null;
  return (input) => {
    let image = sharp(input).rotate();
    if (maxSize) image = image.resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true });
    if (/\.jpe?g$/i.test(name)) return image.jpeg({ quality: 80, mozjpeg: true });
    if (/\.webp$/i.test(name)) return image.webp({ quality: 80 });
    return image.png({ compressionLevel: 9, adaptiveFiltering: true });
  };
}

async function publish(root, output, name) {
  const source = join(root, "img", name);
  const target = join(output, name);
  await mkdir(dirname(target), { recursive: true });
  if (/\.json$/i.test(name) || /_kolorowanie\/previews\//.test(name)) {
    await copyFile(source, target);
  } else {
    const original = await readFile(source);
    const optimized = await encoder(name)(original).toBuffer();
    // Re-encoding an already small file can grow it; keep whichever is lighter.
    await writeFile(target, optimized.length < original.length ? optimized : original);
  }
  if (isReproduction(name)) {
    const thumbnail = join(output, thumbnailPath(name));
    await mkdir(dirname(thumbnail), { recursive: true });
    await sharp(source).rotate().resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toFile(thumbnail);
  }
}

async function listFiles(directory, relative = "") {
  const entries = await readdir(join(directory, relative), { withFileTypes: true }).catch(() => []);
  const groups = await Promise.all(entries.map(async (entry) => {
    const name = posix.join(relative, entry.name);
    if (entry.isDirectory()) return listFiles(directory, name);
    return entry.isFile() ? [name] : [];
  }));
  return groups.flat();
}

async function removeEmptyDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) if (entry.isDirectory()) await removeEmptyDirectories(join(directory, entry.name));
  if (!(await readdir(directory)).length) await rmdir(directory);
}

async function runPool(items, limit, task) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await task(items[next++]);
  }));
}

export async function prepareAssets(root = process.cwd()) {
  const output = join(root, "public", "art");
  await mkdir(output, { recursive: true });
  await mkdir(join(root, "src", "data"), { recursive: true });
  const files = (await listFiles(join(root, "img")))
    .filter((name) => publishedAssets.some((pattern) => pattern.test(name)))
    .sort();

  const cachePath = join(output, CACHE_FILE);
  const cache = JSON.parse(await readFile(cachePath, "utf8").catch(() => "{}"));
  const entries = cache.version === PIPELINE_VERSION && cache.files ? cache.files : {};
  const signatures = Object.fromEntries(await Promise.all(files.map(async (name) => {
    const info = await stat(join(root, "img", name));
    return [name, `${info.size}:${Math.round(info.mtimeMs)}`];
  })));
  const exists = (path) => stat(path).then(() => true, () => false);
  const stale = [];
  for (const name of files) {
    const fresh = entries[name] === signatures[name]
      && await exists(join(output, name))
      && (!isReproduction(name) || await exists(join(output, thumbnailPath(name))));
    if (!fresh) stale.push(name);
  }
  await runPool(stale, 4, (name) => publish(root, output, name));

  // Files removed or renamed in img/ must not linger in the static export.
  const expected = new Set([CACHE_FILE, ...files, ...files.filter(isReproduction).map(thumbnailPath)]);
  const removed = (await listFiles(output)).filter((name) => !expected.has(name));
  await Promise.all(removed.map((name) => rm(join(output, name))));
  if (removed.length) await removeEmptyDirectories(output);
  await mkdir(output, { recursive: true });
  await writeFile(cachePath, JSON.stringify({ version: PIPELINE_VERSION, files: signatures }) + "\n");
  if (stale.length || removed.length) console.log(`Assets: ${stale.length} prepared, ${removed.length} removed, ${files.length} published.`);

  const manifestPath = join(root, "src", "data", "asset-manifest.json");
  const manifest = JSON.stringify(files, null, 2) + "\n";
  // Avoid unnecessary hot reloads when only an existing image changes.
  if (await readFile(manifestPath, "utf8").catch(() => null) !== manifest) {
    await writeFile(manifestPath, manifest);
  }
  await prepareDecorationGeometry(root, files);
}

export function watchAssets(root = process.cwd()) {
  let timer;
  let pending = Promise.resolve();
  const watcher = watch(join(root, "img"), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      pending = pending.then(() => prepareAssets(root)).catch((error) => {
        console.error("Could not refresh scene assets:", error.message);
      });
    }, 250);
  });
  return () => {
    clearTimeout(timer);
    watcher.close();
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await prepareAssets();
  if (process.argv.includes("--watch")) {
    const stop = watchAssets();
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  }
}
