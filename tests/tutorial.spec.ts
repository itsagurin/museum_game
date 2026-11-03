import { test, expect } from "@playwright/test";
import { artworks } from "../src/data/eras";
import { copy } from "../src/data/copy";
import { fillCanvas } from "./helpers/catalog-coloring";

test("a new player gets three tips, a small board, a first decoration and no repeated tutorial", async ({page}) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/#era-1");
  await page.locator(".painting-frame").first().click();
  await expect(page.locator(".tutorial-hint")).toContainText(copy.pl.tutorialChoose);
  const svg = page.locator("svg.coloring-canvas");
  const viewbox = (await svg.getAttribute("viewBox"))!.split(" ").map(Number);
  expect(Math.max(viewbox[2],viewbox[3])).toBe(16);
  await expect(svg.locator(".pixel-number").first()).toBeVisible();
  await page.locator(".paint-brush").first().click();
  await expect(page.locator(".tutorial-hint")).toContainText(copy.pl.tutorialPaint);
  await page.locator(".pixel-hit.matching").evaluateAll(cells=>cells.slice(0,3).forEach(cell=>cell.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}))));
  await expect(page.locator(".tutorial-hint")).toContainText(copy.pl.tutorialStreak);
  await fillCanvas(page);
  await page.getByRole("button",{name:"Odkryj opowieść",exact:true}).click();
  await page.getByRole("button",{name:"Wróć do pokoju",exact:true}).click();
  await expect(page.locator(".room-level-label")).toContainText("1 / 9");
  await page.reload();
  await page.locator(".painting-frame").nth(1).click();
  await expect(page.locator(".coloring-canvas")).toBeVisible();
  await expect(page.locator(".tutorial-hint")).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("heritage-hearth-ui-v1")!).state.completedArtworkIds)).toContain(artworks[0].id);
});

test("high contrast persists, zooms on phones and supports arrow navigation", async ({page,isMobile}) => {
  await page.goto("/");
  await page.getByRole("button",{name:"Ustawienia",exact:true}).click();
  await page.getByRole("switch",{name:copy.pl.highContrast,exact:true}).click();
  await page.keyboard.press("Escape");
  await page.goto("/#era-1");
  await page.locator(".painting-frame").first().click();
  await expect(page.locator("html")).toHaveClass(/high-contrast/);
  if(isMobile) {
    const ratio=await page.locator(".coloring-canvas").evaluate(svg=>svg.getBoundingClientRect().width/svg.parentElement!.getBoundingClientRect().width);
    expect(ratio).toBeCloseTo(1.5,1);
  }
  const hits=page.locator(".pixel-hit");
  await hits.first().focus(); await page.keyboard.press("ArrowRight"); await expect(hits.nth(1)).toBeFocused();
  await page.reload(); await expect(page.locator("html")).toHaveClass(/high-contrast/);
});
