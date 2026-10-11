import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";
import { artworks, getEra } from "../../src/data/eras";
import type { ColoringArtwork } from "../../src/lib/coloring";

export const catalogPaintings = artworks.map((artwork) => ({
  artwork,
  era: getEra(artwork.eraId),
  painting: JSON.parse(readFileSync(`img/${artwork.coloringArtworkId}`, "utf8")) as ColoringArtwork,
}));
export type CatalogPainting = (typeof catalogPaintings)[number];

export async function openCatalogStudio(page: Page, entry: CatalogPainting) {
  await page.goto("/#library");
  await expect(page.locator(".library-scroll")).toBeVisible();
  const backToCollection = page.getByRole("button", { name: "Wróć do kolekcji", exact: true });
  if (await backToCollection.isVisible()) await backToCollection.click();
  await page.getByRole("button", { name: `${entry.artwork.title.pl} — ${entry.era.name.pl}`, exact: true }).click();
  await page.getByRole("button", { name: "Otwórz pracownię", exact: true }).click();
  const canvas = page.getByLabel(`Kolorowanie: ${entry.artwork.title.pl}`, { exact: true });
  await expect(canvas).toBeVisible();
  return canvas;
}

export async function fillCanvas(page: Page) {
  const palette = page.getByRole("group", { name: "Wybierz kolor", exact: true });
  await expect(palette).toBeVisible();
  for (const brush of await palette.getByRole("button").all()) {
    await brush.click();
    // Exercise the real painter rather than forging a completion callback.
    await page.locator(".pixel-hit.matching:not(.painted)").evaluateAll((pixels) => {
      for (const pixel of pixels) pixel.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
  }
  await expect(page.getByRole("button", { name: "Odkryj opowieść", exact: true })).toBeEnabled();
}

export const savedCompletions = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("heritage-hearth-ui-v1") ?? '{"state":{}}').state.completedArtworkIds ?? []);
