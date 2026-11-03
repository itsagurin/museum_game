export function normalizeBasePath(base = "") {
  if (base.includes(":") || base.includes("..")) throw new Error("Invalid base path");
  const clean = base.replace(/^\/+|\/+$/g, "");
  return clean ? `/${clean}` : "";
}
export function pwaUrl(path, base = "") {
  return `${normalizeBasePath(base)}/${path.replace(/^\/+/, "")}`;
}
