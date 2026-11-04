import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import lighthouse from "lighthouse";
import puppeteer from "puppeteer-core";
import { chromium } from "@playwright/test";

const origin = process.env.AUDIT_URL || "http://127.0.0.1:3101";
const directory = resolve(process.env.AUDIT_OUTPUT || ".lighthouseci/mobile");
const scenes = { home: "home", hall: "hall", room: "era-1", library: "library", studio: "era-1" };
const selected = process.argv.slice(2).filter(name => name in scenes);
const results = [];
const runs = Number(process.env.AUDIT_RUNS || 3);
if (!Number.isInteger(runs) || runs < 1 || runs > 5) throw new Error("AUDIT_RUNS must be an integer from 1 to 5");
let version;
await mkdir(directory, { recursive: true });
for (const name of selected.length ? selected : Object.keys(scenes)) {
  for (let run = 1; run <= runs; run++) {
  const browser = await puppeteer.launch({ executablePath: chromium.executablePath(), headless: true, args: ["--no-sandbox", "--remote-debugging-port=0", ...(new URL(origin).protocol === "https:" && ["127.0.0.1", "localhost"].includes(new URL(origin).hostname) ? ["--ignore-certificate-errors"] : [])] });
  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(({studio, full}) => {
      if (full && /^https?:$/.test(location.protocol)) localStorage.setItem("heritage-hearth-ui-v1", JSON.stringify({ version: 1, state: { tutorialSeen: true, exploreAll: true } }));
      if (!studio) return;
      // Audit instrumentation only: use the same room button as a player. No application backdoor.
      const observer = new MutationObserver(() => {
        const frame = document.querySelector(".painting-frame");
        if (frame) { observer.disconnect(); frame.click(); }
      });
      observer.observe(document, { childList: true, subtree: true });
    }, {studio: name === "studio", full: process.env.AUDIT_FULL_BOARD === "1"});
    const result = await lighthouse(`${origin}/#${scenes[name]}`, {
      port: Number(new URL(browser.wsEndpoint()).port), output: ["json", "html"], logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices"],
    }, undefined, page);
    if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError));
    if (name === "studio" && !await page.$(".pixel-hit")) throw new Error("The studio did not open during navigation");
    for (const [index, extension] of ["json", "html"].entries()) await writeFile(`${directory}/${name}-${run}.${extension}`, result.report[index]);
    version = result.lhr.lighthouseVersion;
    const { audits, categories } = result.lhr;
    const row = { scene: name, run, benchmarkIndex: result.lhr.environment.benchmarkIndex, cells: name === "studio" ? await page.$$eval(".pixel-hit", cells => cells.length) : undefined, performance: Math.round(categories.performance.score * 100), accessibility: Math.round(categories.accessibility.score * 100), bestPractices: Math.round(categories["best-practices"].score * 100), lcpMs: Math.round(audits["largest-contentful-paint"].numericValue), cls: audits["cumulative-layout-shift"].numericValue, transferredBytes: audits["total-byte-weight"].numericValue, tbtMs: Math.round(audits["total-blocking-time"].numericValue) };
    results.push(row);
    console.log(JSON.stringify(row));
  } finally { await browser.close(); }
  }
}
const median = values => [...values].sort((a,b) => a-b)[Math.floor(values.length/2)];
const medians = [...new Set(results.map(row => row.scene))].map(scene => {
  const rows = results.filter(row => row.scene === scene);
  return {scene, ...Object.fromEntries(["performance", "accessibility", "bestPractices", "lcpMs", "cls", "transferredBytes", "tbtMs", "benchmarkIndex"].map(key => [key, median(rows.map(row => row[key]))]))};
});
await writeFile(`${directory}/summary.json`, JSON.stringify({ date: new Date().toISOString(), lighthouse: version, url: origin, mode: `mobile, default simulated throttling, cold navigation, ${process.env.AUDIT_FULL_BOARD === "1" ? "returning full board" : "new player with intro"}`, results: medians, runs: results }, null, 2) + "\n");
if (process.env.AUDIT_ASSERT === "1" && medians.some(row => row.performance < 90 || row.accessibility < 95 || row.bestPractices < 95 || row.lcpMs >= 2500 || row.cls >= 0.1 || (row.scene === "home" && row.transferredBytes >= 1500000))) process.exitCode = 1;
