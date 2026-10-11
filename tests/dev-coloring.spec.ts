import { test, expect, type Page } from "@playwright/test";
import { artworks } from "../src/data/eras";
import { catalogPaintings } from "./helpers/catalog-coloring";

const { painting, artwork: catalogEntry } = catalogPaintings[0];
const matchingId = painting.grid.data[0][0];
const matchingColor = painting.palette.find((color) => color.id === matchingId)!;
const wrongColor = painting.palette.find((color) => color.id !== matchingId)!;
const collectionCount = artworks.filter((artwork) => artwork.eraId === catalogEntry?.eraId).length;
const countFor = (id: number) => painting.grid.data.flat().filter((color) => color === id).length;

async function openStudio(page: Page) {
  await page.goto(`/#${catalogEntry!.eraId}`);
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: `${catalogEntry!.title.pl} — Czeka na kolory`, exact: true }).click();
  await expect(page.getByLabel(`Kolorowanie: ${catalogEntry.title.pl}`, { exact: true })).toBeVisible();
  const dev = page.getByRole("button", { name: "DEV: wypełniaj cały kolor", exact: true });
  test.skip(await dev.count() === 0, "Dev tools are disabled in this build; run against npm run dev or build with NEXT_PUBLIC_ENABLE_DEV_TOOLS=1.");
  return dev;
}

test("dev fill paints only the matching colour and undo preserves earlier individual pixels", async ({ page, isMobile }) => {
  const dev = await openStudio(page);
  const canvas = page.getByLabel(`Kolorowanie: ${catalogEntry.title.pl}`, { exact: true });
  const field = canvas.locator(`.pixel-hit[data-color-id="${matchingId}"]`).first();
  const tap = async () => {
    const box = (await field.boundingBox())!;
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    if (isMobile) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
  };
  await expect(dev).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: `Kolor ${matchingColor.id}: ${matchingColor.name}`, exact: true }).click();
  await tap();
  await expect(canvas.locator(".pixel-hit.painted")).toHaveCount(1);
  await dev.click();
  await page.getByRole("button", { name: `Kolor ${wrongColor.id}: ${wrongColor.name}`, exact: true }).click();
  await tap();
  await expect(canvas.locator(".pixel-hit.painted")).toHaveCount(1);
  await page.getByRole("button", { name: `Kolor ${matchingColor.id}: ${matchingColor.name}`, exact: true }).click();
  await tap();
  await expect(canvas.locator(".pixel-hit.painted")).toHaveCount(countFor(matchingId));
  await expect(canvas.locator(`.pixel-hit.painted:not([data-color-id="${matchingId}"])`)).toHaveCount(0);
  await tap();
  await expect(canvas.locator(".pixel-hit.painted")).toHaveCount(countFor(matchingId));
  await page.getByRole("button", { name: "Cofnij", exact: true }).click();
  await expect(canvas.locator(".pixel-hit.painted")).toHaveCount(1);
  await expect(field).toHaveAttribute("aria-pressed", "true");
  await dev.click();
  await canvas.locator(`.pixel-hit[data-color-id="${matchingId}"]:not(.painted)`).first().press("Enter");
  await expect(canvas.locator(".pixel-hit.painted")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await expect(page.locator(".room-status")).toContainText(`0 / ${collectionCount}`);
});

test("one matching pixel per colour completes the painting and still supports undo and saved restoration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const dev = await openStudio(page);
  await dev.click();
  const canvas = page.getByLabel(`Kolorowanie: ${catalogEntry.title.pl}`, { exact: true });
  for (const color of painting.palette) {
    await page.getByRole("button", { name: `Kolor ${color.id}: ${color.name}`, exact: true }).click();
    await canvas.locator(`.pixel-hit[data-color-id="${color.id}"]`).first().press("Enter");
    await expect(canvas.locator(`.pixel-hit.painted[data-color-id="${color.id}"]`)).toHaveCount(countFor(color.id));
  }
  await expect(canvas.locator(".pixel-hit.painted")).toHaveCount(1024);
  await expect(page.getByRole("button", { name: "Odkryj opowieść", exact: true })).toBeEnabled();
  await expect(page.getByRole("region", { name: "Odrodzone arcydzieło", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cofnij", exact: true }).click();
  const last = painting.palette.at(-1)!;
  await expect(canvas.locator(".pixel-hit.painted")).toHaveCount(1024 - countFor(last.id));
  await expect(page.getByRole("button", { name: "Dokończ swoje płótno", exact: true })).toBeDisabled();
  await expect(page.getByRole("region", { name: "Odrodzone arcydzieło", exact: true })).toHaveCount(0);
  await canvas.locator(`.pixel-hit[data-color-id="${last.id}"]`).first().press("Enter");
  await expect(page.getByRole("button", { name: "Odkryj opowieść", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Odkryj opowieść", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(page.getByRole("dialog")).toContainText(catalogEntry.title.pl);
  await page.getByRole("button", { name: "Wróć do pokoju", exact: true }).click();
  await expect(page.locator(".room-status")).toContainText(`1 / ${collectionCount}`);
  await page.reload();
  await expect(page.locator(".room-status")).toContainText(`1 / ${collectionCount}`);
});
