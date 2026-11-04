import { readFile, mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = process.env.AUDIT_URL || "http://127.0.0.1:3101";
const output = process.env.AUDIT_OUTPUT || ".lighthouseci/interactions";
const catalog = JSON.parse(await readFile("content/artworks.json", "utf8"));
const boards = await Promise.all(catalog.map(async artwork => ({ artwork, board: JSON.parse(await readFile(`img/${artwork.puzzle}`, "utf8")) })));
const { artwork, board } = boards.sort((a, b) => b.board.grid.width * b.board.grid.height - a.board.grid.width * a.board.grid.height)[0];
const target = new URL(process.env.AUDIT_URL || "http://127.0.0.1:3101");
const localTLS = target.protocol === "https:" && ["localhost", "127.0.0.1"].includes(target.hostname);
const browser = await chromium.launch({ args: localTLS ? ["--ignore-certificate-errors"] : [] });
try {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, deviceScaleFactor: 1, serviceWorkers: "block" });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem("heritage-hearth-ui-v1", JSON.stringify({ version: 1, state: { tutorialSeen: true, exploreAll: true, autoFill: false } })));
  await page.goto(`${origin}/#library`);
  await page.locator(`[data-artwork-id="${artwork.id}"]`).click();
  await page.getByRole("button", { name: "Otwórz pracownię", exact: true }).click();
  await page.locator(".pixel-hit").first().waitFor();
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(800);
  const session = await context.newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.evaluate(() => {
    window.__timings = [];
    window.__timingObserver = new PerformanceObserver(list => window.__timings.push(...list.getEntries().filter(event => event.interactionId).map(event => ({ name: event.name, duration: event.duration, id: event.interactionId }))));
    window.__timingObserver.observe({ type: "event", durationThreshold: 16 });
  });
  await page.getByRole("button", { name: "Powiększ płótno", exact: true }).click();
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(500);
  for (let colorIndex = 0; colorIndex < 5; colorIndex++) {
    await page.locator(".paint-brush").nth(colorIndex % board.palette.length).click();
    for (let index = 0; index < 6; index++) {
      const pixel = page.locator(".pixel-hit.matching:not(.painted)").first();
      await pixel.evaluate(element => element.focus());
      await page.keyboard.press("Enter");
      await page.waitForTimeout(120);
    }
    await page.locator(".coloring-undo").click();
  }
  await page.waitForTimeout(500);
  const painted = await page.locator(".pixel-hit.painted").count();
  if (painted !== 25) throw new Error(`Expected 30 strokes and five undos; got ${painted} cells`);
  const timings = await page.evaluate(() => window.__timings);
  const interactions = [...new Map(timings.map(event => [event.id, Math.max(event.duration, ...timings.filter(other => other.id === event.id).map(other => other.duration))])).values()].sort((a, b) => a - b);
  if (!interactions.length) throw new Error("No Event Timing samples collected");
  const result = { artwork: artwork.id, cells: board.grid.width * board.grid.height, painted, numberedCells: await page.locator(".pixel-number").count(), viewport: "375×812", cpuSlowdown: 4, method: "41 trusted interactions: zoom, palette, keyboard paint, undo; Event Timing (16ms threshold)", measuredInteractions: interactions.length, maxMs: interactions.at(-1), p98Ms: interactions[Math.max(0, Math.ceil(interactions.length * 0.98) - 1)], timings };
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: `${output}/studio.png` });
  await writeFile(`${output}/interactions.json`, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify({ ...result, timings: undefined }));
  if (process.env.AUDIT_ASSERT === "1" && result.maxMs >= 200) process.exitCode = 1;
} finally { await browser.close(); }
