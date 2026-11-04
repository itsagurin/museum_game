import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";
import { copy } from "../../src/data/copy";
import { coloringCopy } from "../../src/data/coloring-copy";
import type { Language } from "../../src/types/game";
import { seedGame } from "./game-state";
import { artworks } from "./catalog";
import { getEra } from "../../src/data/eras";
import type { ColoringArtwork } from "../../src/lib/coloring";

export const catalogPaintings = artworks.map((artwork) => ({
  artwork,
  era: getEra(artwork.eraId),
  painting: JSON.parse(readFileSync(`img/${artwork.coloringArtworkId}`, "utf8")) as ColoringArtwork,
}));
export type CatalogPainting = (typeof catalogPaintings)[number];

export async function openCatalogStudio(page: Page, entry: CatalogPainting, language: Language = "pl") {
  await seedGame(page, {tutorialSeen:true,language});
  // Catalogue tests exercise full boards; onboarding has its own first-session flow.
  await page.addInitScript(() => {
    const key="heritage-hearth-ui-v1";
    const saved=JSON.parse(localStorage.getItem(key) ?? '{"version":1,"state":{}}');
    saved.state.tutorialSeen=true;
    localStorage.setItem(key,JSON.stringify(saved));
  });
  await page.goto("/#library");
  await page.reload();
  await expect(page.locator(".library-scroll")).toBeVisible();
  const backToCollection = page.getByRole("button", { name: copy[language].libraryBack, exact: true });
  if (await backToCollection.isVisible()) await backToCollection.click();
  await page.getByRole("button", { name: `${entry.artwork.title[language]} — ${entry.era.name[language]}`, exact: true }).click();
  await page.getByRole("button", { name: copy[language].restore, exact: true }).click();
  const canvas = page.getByLabel(`${coloringCopy[language].canvas}: ${entry.artwork.title[language]}`, { exact: true });
  await expect(canvas).toBeVisible();
  return canvas;
}

export async function fillCanvas(page: Page, language: Language = "pl") {
  const palette = page.getByRole("group", { name: coloringCopy[language].chooseColor, exact: true });
  await expect(palette).toBeVisible();
  for (const brush of await palette.getByRole("button").all()) {
    await brush.click();
    // Exercise the real painter rather than forging a completion callback.
    await page.locator(".pixel-hit.matching:not(.painted)").evaluateAll((pixels) => {
      for (const pixel of pixels) pixel.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    // Assistance may finish this colour asynchronously before the next brush.
    await expect(page.locator(".pixel-hit.matching:not(.painted)")).toHaveCount(0);
  }
  await expect(page.getByRole("button", { name: coloringCopy[language].discover, exact: true })).toBeEnabled();
}

export const savedCompletions = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("heritage-hearth-ui-v1") ?? '{"state":{}}').state.completedArtworkIds ?? []);

/** Acknowledge newly earned badges while leaving era/finale notices for their own assertions. */
export async function dismissBadges(page: Page) {
  for(let index=0;index<30;index++) {
    const title=page.getByRole("dialog").getByRole("heading",{name:copy.pl.badgeTitle,exact:true});
    if(!await title.waitFor({state:"visible",timeout:500}).then(()=>true,()=>false)) return;
    await page.getByRole("dialog").getByRole("button",{name:copy.pl.stayHere,exact:true}).click();
  }
  throw new Error("Badge queue did not finish");
}
