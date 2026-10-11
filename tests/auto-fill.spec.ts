import { test, expect, type Page } from "@playwright/test";
import { catalogPaintings, openCatalogStudio } from "./helpers/catalog-coloring";

const entry = catalogPaintings[0];
const color = entry.painting.palette.find(candidate => entry.painting.grid.data.flat().filter(id => id === candidate.id).length >= 30)!;
const colorTotal = entry.painting.grid.data.flat().filter(id => id === color.id).length;

async function paint(page: Page, count: number) {
  await page.locator(`.pixel-hit[data-color-id="${color.id}"]:not(.painted)`).evaluateAll((pixels, count) => {
    for (const pixel of pixels.slice(0, count)) pixel.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  }, count);
}

async function chooseColor(page: Page) {
  await page.getByRole("button", { name: `Kolor ${color.id}: ${color.name}`, exact: true }).click();
}

test("five correct new pixels of one colour trigger an animated wave; mistakes reset the streak and undo restores manual work", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openCatalogStudio(page, entry);
  await chooseColor(page);
  await paint(page, 4);
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(4);
  await page.locator(".pixel-hit.painted").first().press("Enter");
  await page.locator(`.pixel-hit:not([data-color-id="${color.id}"])`).first().press("Enter");
  await paint(page, 4);
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(8);
  await paint(page, 1);
  await expect(page.locator(".auto-fill-wave")).toBeVisible();
  await expect(page.getByRole("button", { name: "Dokończ swoje płótno", exact: true })).toBeDisabled();
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(colorTotal);
  await expect(page.locator(`.pixel-hit.painted:not([data-color-id="${color.id}"])`)).toHaveCount(0);
  await expect(page.locator(".revealed-image")).toHaveCount(0);
  await page.getByRole("button", { name: "Cofnij", exact: true }).click();
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(8);
  await expect(page.locator(".revealed-image")).toHaveCount(0);
});

test("the settings switch persists and disabling assistance keeps painting manual", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ustawienia", exact: true }).click();
  const toggle = page.getByRole("switch", { name: "Automatyczne kolorowanie", exact: true });
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await page.reload();
  await page.getByRole("button", { name: "Ustawienia", exact: true }).click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await page.keyboard.press("Escape");
  await openCatalogStudio(page, entry);
  await chooseColor(page);
  await paint(page, 15);
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(15);
  await expect(page.locator(".auto-fill-wave")).toHaveCount(0);
  await expect(page.locator(".auto-fill-hint")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Dokończ swoje płótno", exact: true })).toBeDisabled();
});

test("undo cancels a running wave and reduced motion still completes only the selected colour", async ({ page }) => {
  await openCatalogStudio(page, entry);
  await chooseColor(page);
  await paint(page, 5);
  await expect(page.locator(".auto-fill-wave")).toBeVisible();
  await page.getByRole("button", { name: "Cofnij", exact: true }).click();
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(4);
  await expect(page.locator(".auto-fill-wave")).toHaveCount(0);
  // Advancing beyond the wave duration must not repaint the cancelled cells.
  await page.waitForTimeout(2000);
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(4);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await paint(page, 5);
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(colorTotal);
  await expect(page.locator(".auto-fill-wave")).toHaveCount(0);
  await expect(page.locator(`.pixel-hit.painted:not([data-color-id="${color.id}"])`)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Dokończ swoje płótno", exact: true })).toBeDisabled();
  const nextColor = entry.painting.palette.find(candidate => candidate.id !== color.id && entry.painting.grid.data.flat().filter(id => id === candidate.id).length >= 5)!;
  await page.getByRole("button", { name: `Kolor ${nextColor.id}: ${nextColor.name}`, exact: true }).click();
  await page.locator(".pixel-hit.matching:not(.painted)").evaluateAll(pixels => {
    for (const pixel of pixels.slice(0, 4)) pixel.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  });
  await expect(page.locator(`.pixel-hit.painted[data-color-id="${nextColor.id}"]`)).toHaveCount(4);
  await page.locator(".pixel-hit.matching:not(.painted)").first().press("Enter");
  await expect(page.locator(`.pixel-hit.painted[data-color-id="${nextColor.id}"]`)).toHaveCount(entry.painting.grid.data.flat().filter(id => id === nextColor.id).length);
});
