/** Match the source filename within its era; numeric names repeat across eras. */
export function getColoringAssets(sourceFile: string, files: readonly string[]) {
  const separator = sourceFile.indexOf("/");
  if (separator < 1) return undefined;
  const eraFolder = sourceFile.slice(0, separator);
  const stem = sourceFile.slice(separator + 1).replace(/\.[^/.]+$/, "");
  const prefix = `${eraFolder}_kolorowanie/json/${stem}`;
  const candidates = files.filter((file) => file.startsWith(prefix) && /^_grid\d+\.json$/i.test(file.slice(prefix.length)));
  // Multiple exports need an explicit choice rather than silently mixing grids.
  if (candidates.length !== 1) return undefined;
  const jsonFile = candidates[0];
  const preview = jsonFile.replace("/json/", "/previews/").replace(/\.json$/i, "_art.png");
  return { jsonFile, previewFile: files.includes(preview) ? preview : undefined };
}
