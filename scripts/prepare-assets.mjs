import { mkdir, copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import { watch } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareDecorationGeometry } from "./decoration-geometry.mjs";

export async function prepareAssets(root = process.cwd()) {
  const output = join(root, "public", "art");
  await mkdir(output, { recursive: true });
  await mkdir(join(root, "src", "data"), { recursive: true });
  const collectAssets = async (relative = "") => {
    const entries = await readdir(join(root, "img", relative), { withFileTypes: true });
    const groups = await Promise.all(entries.map(async (entry) => {
      const name = posix.join(relative, entry.name);
      if (entry.isDirectory()) return collectAssets(name);
      return entry.isFile() && /\.(jpg|jpeg|png|webp|json)$/i.test(name) ? [name] : [];
    }));
    return groups.flat();
  };
  const files = (await collectAssets()).sort();
  await Promise.all(files.map(async (name) => {
    await mkdir(dirname(join(output, name)), { recursive: true });
    await copyFile(join(root, "img", name), join(output, name));
  }));
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
