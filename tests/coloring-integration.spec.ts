import { test, expect } from "@playwright/test";
import { artworks, eras } from "../src/data/eras";
import curiosities from "../src/data/artworks_curiosities.json" with { type: "json" };
import { catalogPaintings, fillCanvas, openCatalogStudio, savedCompletions } from "./helpers/catalog-coloring";

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); });

for (const era of eras) {
  const collection = catalogPaintings.filter((entry) => entry.artwork.eraId === era.id);
  test(`${era.name.pl}: supplied grids and palettes open from the library`, async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (request) => { if (request.url().includes("/json/")) requested.push(request.url()); });
    await page.goto("/#library");
    expect(requested).toEqual([]);
    for (const entry of [collection[0], collection.at(-1)!]) {
      const canvas = await openCatalogStudio(page, entry);
      await expect(canvas.locator(".pixel-hit")).toHaveCount(entry.painting.grid.width * entry.painting.grid.height);
      expect(await canvas.locator(".pixel-hit").evaluateAll((pixels) => pixels.map((pixel) => Number(pixel.getAttribute("data-color-id"))))).toEqual(entry.painting.grid.data.flat());
      for (const color of entry.painting.palette) {
        await expect(page.getByRole("button", { name: `Kolor ${color.id}: ${color.name}`, exact: true })).toHaveAttribute("data-color-id", String(color.id));
        await expect(canvas.locator(`.pixel-hit[data-color-id="${color.id}"]`).first().locator("..").locator("rect").first()).toHaveAttribute("fill", color.hex);
      }
      await expect(page.getByRole("dialog")).not.toContainText("Mistrz Polski");
      await expect(page.getByRole("button", { name: "Dokończ swoje płótno", exact: true })).toBeDisabled();
      expect(await page.getByRole("dialog").boundingBox()).toMatchObject({ x: 0, y: 0, ...page.viewportSize()! });
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      expect(requested.at(-1)).toContain(entry.artwork.coloringSource!);
    }
    expect(await savedCompletions(page)).toEqual([]);
  });

  test(`${era.name.pl}: finish a painting outside the wall, reveal its original and save its wall position`, async ({ page }) => {
    const entry = collection[5];
    await openCatalogStudio(page, entry);
    await fillCanvas(page);
    await expect(page.locator(".revealed-image")).toHaveAttribute("src", entry.artwork.originalImage!);
    await expect.poll(() => page.locator(".revealed-image").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Odkryj opowieść", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await expect(page.getByRole("dialog")).toContainText(entry.artwork.title.pl);
    const curiosity = curiosities.find((item) => item.filename === `assets/artworks/${entry.artwork.sourceFile}`)!;
    await expect(page.locator(".fun-fact p")).toHaveText(curiosity.curiosity);
    await page.getByRole("button", { name: "Wróć do pokoju", exact: true }).click();
    expect(await savedCompletions(page)).toEqual([entry.artwork.id]);
    await page.getByLabel("Miejsce na ścianie", { exact: true }).selectOption(`${era.id}-slot-2`);
    await page.getByRole("button", { name: "Zawieś w pokoju", exact: true }).click();
    const frame = page.locator(`[data-slot-id="${era.id}-slot-2"] .painting-frame`);
    await expect(frame).toHaveAttribute("aria-label", `${entry.artwork.title.pl} — Odnowiony`);
    await expect(frame.locator(".original-artwork")).toHaveAttribute("src", entry.artwork.originalImage!);
    await expect(page.locator(".room-status")).toContainText(`1 / ${collection.length}`);
    await page.reload();
    await expect(frame).toHaveAttribute("aria-label", `${entry.artwork.title.pl} — Odnowiony`);
    expect(await savedCompletions(page)).toEqual([entry.artwork.id]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("matching palette IDs reject a wrong tap and undo restores the individual pixel", async ({ page, isMobile }) => {
  const entry = catalogPaintings[0];
  const canvas = await openCatalogStudio(page, entry);
  const field = canvas.locator(".pixel-hit").first();
  const correct = entry.painting.palette.find((color) => color.id === entry.painting.grid.data[0][0])!;
  const wrong = entry.painting.palette.find((color) => color.id !== correct.id)!;
  const tap = async () => {
    const box = (await field.boundingBox())!;
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    if (isMobile) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y);
  };
  await page.getByRole("button", { name: `Kolor ${wrong.id}: ${wrong.name}`, exact: true }).click();
  await tap();
  await expect(field).toHaveCSS("outline-style", "none");
  await expect(canvas.locator(".pixel-hit.painted")).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Ten piksel ma inny kolor" })).toBeVisible();
  await page.getByRole("button", { name: `Kolor ${correct.id}: ${correct.name}`, exact: true }).click();
  await tap(); await tap();
  await expect(canvas.locator(".pixel-hit.painted")).toHaveCount(1);
  await page.getByRole("button", { name: "Cofnij", exact: true }).click();
  await expect(field).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Escape");
  expect(await savedCompletions(page)).toEqual([]);
});

test("a broken JSON can retry and closing a pending load cannot replace another era's grid", async ({ page }) => {
  const first = catalogPaintings[0];
  await page.route(`**${first.artwork.coloringSource}`, (route) => route.fulfill({ json: { grid: { width: 32 } } }));
  await page.goto("/#era-1");
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: `${first.artwork.title.pl} — Czeka na kolory`, exact: true }).click();
  await expect(page.getByText("Nie udało się przygotować obrazu.", { exact: true })).toBeVisible();
  expect(await savedCompletions(page)).toEqual([]);
  await page.unroute(`**${first.artwork.coloringSource}`);
  await page.getByRole("button", { name: "Spróbuj ponownie", exact: true }).click();
  await expect(page.getByLabel(`Kolorowanie: ${first.artwork.title.pl}`, { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  const second = catalogPaintings.find((entry) => entry.artwork.eraId === "era-4")!;
  let release = () => {};
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route(`**${first.artwork.coloringSource}`, async (route) => { await pending; await route.fulfill({ json: first.painting }).catch(() => {}); });
  await page.getByRole("button", { name: `${first.artwork.title.pl} — Czeka na kolory`, exact: true }).click();
  await expect(page.getByText("Przygotowujemy Twoje płótno…", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/#era-4");
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: `${second.artwork.title.pl} — Czeka na kolory`, exact: true }).click();
  const canvas = page.getByLabel(`Kolorowanie: ${second.artwork.title.pl}`, { exact: true });
  await expect(canvas).toBeVisible();
  release();
  expect(await canvas.locator(".pixel-hit").evaluateAll((pixels) => pixels.map((pixel) => Number(pixel.getAttribute("data-color-id"))))).toEqual(second.painting.grid.data.flat());
});

test("English painting and browser back stay connected to room navigation", async ({ page }) => {
  const entry = catalogPaintings.find((item) => item.artwork.eraId === "era-2")!;
  await page.goto("/#hall");
  await page.getByRole("navigation", { name: "Pokoje" }).last().getByRole("button", { name: "Romantyzm", exact: true }).click();
  await page.getByRole("button", { name: "Switch to English", exact: true }).click();
  await page.getByRole("button", { name: "Show the whole scene", exact: true }).click();
  await page.getByRole("button", { name: `${entry.artwork.title.en} — Waiting for colour`, exact: true }).click();
  await expect(page.getByLabel(`Painting: ${entry.artwork.title.en}`, { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Finish your canvas", exact: true })).toBeDisabled();
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hall");
});

test("completed paint survives missing reproductions and replay without duplicate progress", async ({ page }) => {
  const entry = catalogPaintings[0];
  await page.route(`**${entry.artwork.originalImage}`, (route) => route.abort());
  await openCatalogStudio(page, entry);
  await fillCanvas(page);
  await expect(page.getByText("Reprodukcja jest niedostępna. Twój pokolorowany obraz został zachowany.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Odkryj opowieść", exact: true }).click();
  await page.getByRole("button", { name: "Wróć do pokoju", exact: true }).click();
  await page.getByLabel("Miejsce na ścianie", { exact: true }).selectOption("era-1-slot-2");
  await page.getByRole("button", { name: "Zawieś w pokoju", exact: true }).click();
  const wall = page.locator('[data-slot-id="era-1-slot-2"] .pixel-preview');
  await expect(wall).toHaveAttribute("src", entry.artwork.coloredPreview!);
  await expect.poll(() => wall.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.reload();
  await expect(wall).toHaveAttribute("src", entry.artwork.coloredPreview!);
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.locator('[data-slot-id="era-1-slot-2"] .painting-frame').click();
  await page.getByRole("button", { name: `${entry.artwork.title.pl} — Oświecenie`, exact: true }).click();
  await page.getByRole("button", { name: "Pokoloruj ponownie", exact: true }).click();
  await fillCanvas(page);
  await page.getByRole("button", { name: "Odkryj opowieść", exact: true }).click();
  await page.getByRole("button", { name: "Wróć do pokoju", exact: true }).click();
  expect(await savedCompletions(page)).toEqual([entry.artwork.id]);
});

test("finishing the whole collection develops its room and changes the house and hall", async ({ page }) => {
  const entry = catalogPaintings[0];
  const rest = artworks.filter((artwork) => artwork.eraId === "era-1" && artwork.id !== entry.artwork.id).map((artwork) => artwork.id);
  await page.addInitScript((ids) => localStorage.setItem("heritage-hearth-ui-v1", JSON.stringify({ version: 1, state: { language: "pl", gentleMotion: true, completedArtworkIds: ids } })), rest);
  await page.goto("/#era-1");
  await expect(page.getByRole("progressbar", { name: "Rozwój pokoju", exact: true })).toHaveAttribute("aria-valuenow", "8");
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: `${entry.artwork.title.pl} — Czeka na kolory`, exact: true }).click();
  await fillCanvas(page);
  await page.getByRole("button", { name: "Odkryj opowieść", exact: true }).click();
  await page.getByRole("button", { name: "Wróć do pokoju", exact: true }).click();
  await expect(page.locator(".room-status")).toContainText("21 / 21");
  await expect(page.getByRole("progressbar", { name: "Rozwój pokoju", exact: true })).toHaveAttribute("aria-valuenow", "9");
  await page.locator(".back-button").click();
  await expect(page.locator(".hall-canvas > img")).toHaveAttribute("src", "/art/hall2.jpg");
  await page.locator(".back-button").click();
  await expect(page.locator(".home-canvas > img")).toHaveAttribute("src", "/art/house1.jpg");
});

test("the painting dialog and local reveal stay within browser fullscreen", async ({ page }) => {
  const entry = catalogPaintings[0];
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/#era-1");
  await page.getByRole("button", { name: "Pełny ekran", exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: `${entry.artwork.title.pl} — Czeka na kolory`, exact: true }).click();
  await expect(page.getByLabel(`Kolorowanie: ${entry.artwork.title.pl}`, { exact: true })).toBeVisible();
  expect(await page.getByRole("dialog").evaluate((element) => Boolean(document.fullscreenElement?.contains(element)))).toBe(true);
  await fillCanvas(page);
  await expect(page.locator(".revealed-image")).toHaveAttribute("src", catalogPaintings[0].artwork.originalImage!);
});
