// eslint-disable-next-line @typescript-eslint/no-require-imports -- LHCI reads CommonJS configuration.
const { chromium } = require("@playwright/test");

module.exports = {
  ci: {
    collect: {
      startServerCommand: "node scripts/preview-audit.mjs",
      startServerReadyPattern: "Audit export ready",
      startServerReadyTimeout: 60000,
      // LHCI groups Lighthouse 13 reports by finalUrl, which omits the fragment.
      // A query discriminator keeps each real hash view in its own assertion group.
      url: ["https://127.0.0.1:4173/?audit-scene=home#home", "https://127.0.0.1:4173/?audit-scene=hall#hall", "https://127.0.0.1:4173/?audit-scene=era-1#era-1", "https://127.0.0.1:4173/?audit-scene=library#library"],
      numberOfRuns: 3,
      chromePath: chromium.executablePath(),
      settings: { chromeFlags: "--headless --no-sandbox --ignore-certificate-errors", onlyCategories: ["performance", "accessibility", "best-practices"] },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9, aggregationMethod: "median" }],
        "categories:accessibility": ["error", { minScore: 0.95, aggregationMethod: "median" }],
        "categories:best-practices": ["error", { minScore: 0.95, aggregationMethod: "median" }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500, aggregationMethod: "median" }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1, aggregationMethod: "median" }],
        "total-byte-weight": ["error", { maxNumericValue: 1500000, aggregationMethod: "median" }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/lhci" },
  },
};
