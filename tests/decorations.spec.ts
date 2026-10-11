import { test, expect, type Locator, type Page } from "@playwright/test";
import { artworks, eras } from "../src/data/eras";
import { getRoomDecorations } from "../src/data/room-decorations";
import { catalogPaintings, fillCanvas, openCatalogStudio } from "./helpers/catalog-coloring";

async function seed(page: Page, completed: string[], gentleMotion = true) {
  await page.addInitScript(({ completedArtworkIds, gentleMotion }) => {
    if (localStorage.getItem("heritage-hearth-ui-v1")) return;
    localStorage.setItem("heritage-hearth-ui-v1", JSON.stringify({ version: 1, state: { language: "pl", gentleMotion, completedArtworkIds } }));
  }, { completedArtworkIds: completed, gentleMotion });
}
async function objectPoint(object: Locator) {
  return object.evaluate((element) => {
    const b = element.getBoundingClientRect();
    const candidates = [];
    for (let y = b.top + 2; y < b.bottom; y += 3) for (let x = b.left + 2; x < b.right; x += 3) {
      candidates.push({ x, y, distance: (x - b.left - b.width / 2) ** 2 + (y - b.top - b.height * .35) ** 2 });
    }
    for (const { x, y } of candidates.sort((a, b) => a.distance - b.distance))
      if (x > 0 && x < innerWidth && y > 130 && y < innerHeight - 90 && [[0, 0], [-2, 0], [2, 0], [0, -2], [0, 2]].every(([dx, dy]) => document.elementFromPoint(x + dx, y + dy) === element)) return { x, y };
    throw new Error("No visible solid object pixels for interaction");
  });
}

test("all four rooms keep their empty background, show only earned decorations and preserve paintings", async ({ page }) => {
  await seed(page, artworks.map(({ id }) => id));
  for (const era of eras) {
    await page.goto(`/#${era.id}`);
    await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
    await expect(page.locator(".room-decoration")).toHaveCount(getRoomDecorations(era.id, 9).length);
    await expect(page.locator(".room-backdrop .scene-image")).toHaveAttribute("src", `/art/${era.image}`);
    await expect(page.locator(".wall-artwork")).toHaveCount(5);
    await expect(page.locator(".decoration-unlock-toast")).toHaveCount(0);
    await expect.poll(() => page.locator(".room-decoration img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    const first = page.getByRole("button", { name: `Poznaj przedmiot: ${getRoomDecorations(era.id, 9)[0].name.pl}`, exact: true });
    await first.press("Enter");
    await expect(page.getByRole("dialog")).toContainText("Dlaczego w tej epoce?");
    await expect(page.getByRole("dialog").getByRole("link")).toHaveAttribute("href", /^https:/);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Wypełnij ekran sceną", exact: true }).focus();
    await page.screenshot({ path: `/tmp/heritage-decor/${test.info().project.name}-${era.id}.png` });
  }
});

test("object bubbles work on tap and hover, remain on screen, translate and close", async ({ page, isMobile }) => {
  await seed(page, artworks.filter(({ eraId }) => eraId === "era-2").map(({ id }) => id));
  await page.goto("/#era-2");
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await expect.poll(() => page.locator(".room-decoration img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete))).toBe(true);
  const piano = page.getByRole("button", { name: "Poznaj przedmiot: Fortepian", exact: true });
  const p = await objectPoint(piano);
  if (isMobile) await page.touchscreen.tap(p.x, p.y); else await page.mouse.move(p.x, p.y);
  const bubble = page.getByRole("dialog", { name: "Fortepian", exact: true });
  await expect(bubble).toBeVisible();
  const box = (await bubble.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(box.y).toBeGreaterThan(60); expect(box.y + box.height).toBeLessThan(page.viewportSize()!.height - 50);
  await page.screenshot({ path: `/tmp/heritage-decor/${test.info().project.name}-bubble.png` });
  if (!isMobile) {
    await page.mouse.move(box.x + 30, box.y + 80);
    await expect(bubble).toBeVisible();
  }
  await page.getByRole("button", { name: "Zamknij ciekawostkę", exact: true }).click();
  await expect(bubble).toHaveCount(0);
  await page.getByRole("button", { name: "Switch to English", exact: true }).click();
  await page.getByRole("button", { name: "Discover object: Piano", exact: true }).press("Enter");
  await expect(page.getByRole("dialog")).toContainText("Why this era?");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a real painting unlocks an era reward once, including from the library", async ({ page }) => {
  const eraEntries = catalogPaintings.filter(({ artwork }) => artwork.eraId === "era-2");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await seed(page, [eraEntries[0].artwork.id], false); // Two completed artworks reach level 1 in the 18-artwork era.
  await openCatalogStudio(page, eraEntries[1]);
  await fillCanvas(page);
  await page.getByRole("button", { name: "Odkryj opowieść", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Wróć", exact: true }).click();
  await page.locator(".primary-button").click();
  await page.getByRole("button", { name: "Romantyzm", exact: true }).first().click();
  await expect(page.locator(".decoration-unlock-toast")).toContainText("Fortepian");
  await expect(page.locator(".room-decoration.is-unlocking")).toHaveCount(1);
  await expect(page.locator(".room-decoration.is-unlocking img")).toHaveCSS("animation-name", "decoration-glow");
  await expect(page.locator(".room-decoration")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".room-decoration")).toHaveCount(1);
  await expect(page.locator(".decoration-unlock-toast")).toHaveCount(0);
  await page.getByRole("button", { name: "Ustawienia", exact: true }).click();
  await page.getByRole("button", { name: "Zresetuj postęp", exact: true }).click();
  await page.getByRole("button", { name: "Zresetuj", exact: true }).click();
  await expect(page.locator(".room-decoration")).toHaveCount(0);
});

test("a pinned bubble follows the camera and stays usable on a small phone", async ({ page, isMobile }) => {
  await seed(page, artworks.filter(({ eraId }) => eraId === "era-2").map(({ id }) => id));
  await page.goto("/#era-2");
  const piano = page.getByRole("button", { name: "Poznaj przedmiot: Fortepian", exact: true });
  await piano.press("Enter");
  const bubble = page.getByRole("dialog", { name: "Fortepian", exact: true });
  await expect(bubble).toBeVisible();
  const before = await piano.boundingBox();
  await page.locator(".game-viewport").evaluate((viewport) => {
    if (viewport.scrollWidth > viewport.clientWidth) viewport.scrollLeft += 40;
    else viewport.scrollTop += 40;
  });
  await expect.poll(() => piano.boundingBox()).not.toEqual(before);
  await expect(bubble).toBeVisible();
  await page.keyboard.press("Escape");
  if (!isMobile) {
    await page.getByRole("button", { name: "Pełny ekran", exact: true }).click();
    await piano.press("Enter");
    await expect(bubble).toBeVisible();
    expect(await bubble.evaluate((element) => document.fullscreenElement?.contains(element))).toBe(true);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Wyjdź z pełnego ekranu", exact: true }).click();
  }
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: "Poznaj przedmiot: Kufer podróżny", exact: true }).press("Enter");
  const trunk = page.getByRole("dialog", { name: "Kufer podróżny", exact: true });
  await expect(trunk).toBeVisible();
  const bounds = (await trunk.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(bounds.y).toBeGreaterThan(60); expect(bounds.y + bounds.height).toBeLessThan(568 - 50);
  await page.screenshot({ path: `/tmp/heritage-decor/${test.info().project.name}-small-phone.png` });
});
