import { expect, it } from "vitest";
import { pwaUrl, normalizeBasePath } from "../../scripts/pwa-paths.mjs";
it.each(["", "/", "/museum", "/museum/"])("scopes PWA URLs under %s", base => {
  expect(pwaUrl("sw.js",base)).toBe(`${normalizeBasePath(base)}/sw.js`);
  const manifest=new URL(`${normalizeBasePath(base)}/manifest.webmanifest`,"https://game.example");
  expect(new URL("./",manifest).pathname).toBe(`${normalizeBasePath(base)}/`);
});
it("rejects absolute or parent paths",()=>{expect(()=>normalizeBasePath("https://other.example")).toThrow();expect(()=>normalizeBasePath("../escape")).toThrow();});
