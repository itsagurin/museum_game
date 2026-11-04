import { test, expect } from "@playwright/test";
import { seedGame } from "./helpers/game-state";
import { artworks } from "./helpers/catalog";

test("library reserves image space before thumbnails arrive", async ({ page }) => {
  await seedGame(page);
  await page.route("**/art/_thumbs/**", route => route.abort());
  await page.goto("/#library");
  const image = page.locator(".library-card-image img").first();
  await expect(image).toHaveAttribute("width", /^[1-9]\d*$/);
  await expect(image).toHaveAttribute("height", /^[1-9]\d*$/);
  await expect(page.locator(".library-card-image").first()).toBeVisible();
});

test("studio prioritizes its board and fetches the original near completion", async ({ page }) => {
  await seedGame(page, { autoFill: false });
  const reproductions: string[] = [];
  page.on("request", request => { if (/\/art\/era\d_[^/]+\//.test(new URL(request.url()).pathname)) reproductions.push(request.url()); });
  await page.goto("/#era-1");
  await page.locator(".painting-frame").first().click();
  await expect(page.locator(".pixel-hit").first()).toBeVisible();
  expect(reproductions).toEqual([]);
  const requested = page.waitForRequest(request => /\/art\/era\d_[^/]+\//.test(new URL(request.url()).pathname));
  for (const brush of await page.locator(".paint-brush").all()) {
    await brush.click();
    await page.locator(".pixel-hit.matching:not(.painted)").evaluateAll(pixels => {
      for (const pixel of pixels) pixel.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
  }
  await requested;
  expect(reproductions.length).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "Odkryj opowieść", exact: true })).toBeEnabled();
});

test("a failed description chunk keeps navigation usable and retries online", async ({ page }) => {
  await seedGame(page);
  await page.goto("/#era-1");
  // Load the panel shell first; only the descriptions remain on demand.
  await page.getByRole("button", { name: "Ustawienia", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.route("**/_next/static/chunks/**", route => route.abort());
  await page.locator(".painting-note").first().click();
  await expect(page.locator(".fun-fact p")).toContainText("Opowieść jest chwilowo niedostępna");
  await expect(page.getByRole("button", { name: "Wróć do pokoju", exact: true })).toBeEnabled();
  await page.unroute("**/_next/static/chunks/**");
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.locator(".fun-fact p")).toHaveText(artworks[0].funFact!.pl);
});

test("rapid hash navigation finishes the scene transition", async ({ page }) => {
  await seedGame(page, { gentleMotion: false });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator(".home-canvas").waitFor({ state: "attached" });
  for (const view of ["era-1", "home", "era-2", "hall", "era-1"]) {
    await page.evaluate(view => { location.hash = view; }, view);
    await page.waitForTimeout(30);
  }
  await expect(page.getByRole("button", { name: "Pokaż całą scenę", exact: true })).toBeVisible();
  await expect(page.locator(".game-scene[aria-hidden=false] .room-canvas")).toBeVisible();
  await expect(page.locator(".home-canvas")).toHaveCount(0);
});

test("a pending painter traps focus and can be cancelled before its code arrives", async ({ page }) => {
  await seedGame(page);
  await page.goto("/#era-1");
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/_next/static/chunks/**", async route => { await gate; await route.continue(); });
  const loaded = page.waitForResponse(response => response.url().includes("/_next/static/chunks/"));
  try {
    await page.locator(".painting-frame").first().click();
    const close = page.getByRole("dialog").getByRole("button", { name: "Wróć do pokoju", exact: true });
    await expect(page.getByRole("dialog").getByRole("status")).toContainText("Przygotowujemy Twoje płótno");
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  } finally { release(); }
  await loaded;
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.locator(".painting-frame").first().click();
  await expect(page.locator(".pixel-hit").first()).toBeVisible();
});

test("rapid keyboard reopening resumes the painted intro without an undo action", async ({ page }) => {
  await seedGame(page, { tutorialSeen: false, autoFill: false, gentleMotion: false });
  await page.goto("/#era-1");
  const frame = page.locator(".painting-frame").first();
  await frame.click();
  await expect(page.locator(".pixel-hit")).toHaveCount(192);
  await page.locator(".paint-brush").first().click();
  await page.locator(".pixel-hit.matching").first().press("Enter");
  await page.keyboard.press("Escape");
  await frame.press("Enter");
  await expect(page.locator(".pixel-hit")).toHaveCount(192);
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(1);
  await expect(page.locator(".coloring-undo")).toBeDisabled();
});

test("offscreen collection cards keep their accessible names and resume the previous position", async ({ page }) => {
  await seedGame(page);
  const thumbnails = new Set<string>();
  page.on("request", request => { if (request.url().includes("/art/_thumbs/")) thumbnails.add(request.url()); });
  await page.goto("/#library");
  await expect(page.locator(".library-artwork-card")).toHaveCount(83);
  expect(thumbnails.size).toBeLessThan(30);
  const last = page.locator(".library-artwork-card").last();
  const id = await last.getAttribute("data-artwork-id");
  await last.scrollIntoViewIfNeeded();
  await expect(last.locator("img")).toBeVisible();
  const previousScroll = await page.locator(".library-scroll").evaluate(element => element.scrollTop);
  await last.click();
  await expect(page.locator(".library-detail")).toHaveAttribute("data-artwork-id", id!);
  await page.getByRole("button", { name: "Wróć do kolekcji", exact: true }).click();
  await expect(last).toBeFocused();
  await expect(last).toBeInViewport();
  await expect.poll(() => page.locator(".library-scroll").evaluate(element => element.scrollTop)).toBeCloseTo(previousScroll, 0);
});

for (const done of [false, true]) test(`a long ${done ? "completed" : "unfinished"} daily card leaves the illustrated door usable at short and wide sizes`, async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-04T12:00:00") });
  const id = "bacciarelli-portret-doktora-walentego-gagatkiewicza";
  await seedGame(page, { dailySelection: { dateKey: "2026-11-04", artworkId: id }, completedArtworkIds: done ? [id] : [], dailyHistory: done ? ["2026-11-04"] : [] });
  for (const viewport of [{ width: 375, height: 812 }, { width: 375, height: 768 }, { width: 375, height: 750 }, { width: 390, height: 664 }, { width: 375, height: 568 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/#home");
    await expect(page.locator(".daily-card")).toBeVisible();
    if (done) await expect(page.locator(".daily-card p")).toHaveText(artworks.find(artwork => artwork.id === id)!.funFact!.pl);
    const door = (await page.locator(".house-door-hit").boundingBox())!;
    const card = (await page.locator(".daily-card").boundingBox())!;
    expect(door.x + door.width <= card.x || card.x + card.width <= door.x || door.y + door.height <= card.y || card.y + card.height <= door.y).toBe(true);
    await page.locator(".house-door-hit").click();
    await expect(page).toHaveURL(/#hall$/);
  }
});
