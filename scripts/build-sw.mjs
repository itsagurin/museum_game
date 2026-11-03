import { generateSW } from "workbox-build";
import { normalizeBasePath, pwaUrl } from "./pwa-paths.mjs";
const base = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH || "");
const { count, size, warnings } = await generateSW({
  globDirectory: "out", swDest: "out/sw.js", sourcemap: false,
  globPatterns: ["index.html", "_next/static/**/*.{js,css,woff2}", "note.svg", "manifest.webmanifest", "icons/*.png", "art/house*.jpg", "art/hall[1-4].jpg", "art/room[1-4].jpg", "art/blank_paper_crossmark.jpg", "art/_thumbs/**/*.webp"],
  modifyURLPrefix: { "": `${base}/` },
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  navigateFallback: pwaUrl("index.html", base),
  navigateFallbackDenylist: [/\/_next\//, /\/art\//, /\/audio\//],
  skipWaiting: false, clientsClaim: true, cleanupOutdatedCaches: true,
  cacheId: `dziedzictwo${base.replaceAll("/","-")}`,
  runtimeCaching: [
    { urlPattern: /\/art\/puzzles\/[^/]+\.json(?:\?.*)?$/, handler: "StaleWhileRevalidate", options: { cacheName: `heritage-boards${base}`, expiration: { maxEntries: 100 }, cacheableResponse: { statuses: [200] } } },
    { urlPattern: /\/art\/.*\.(?:png|jpe?g|webp)$/i, handler: "CacheFirst", options: { cacheName: `heritage-images${base}`, expiration: { maxEntries: 200, maxAgeSeconds: 30 * 86400 }, cacheableResponse: { statuses: [200] } } },
  ],
});
for (const warning of warnings) console.warn(warning);
console.log(`PWA: precached ${count} files, ${(size / 1024 / 1024).toFixed(2)} MB`);
