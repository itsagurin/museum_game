import { test, expect } from "@playwright/test";
import { artworks, eras } from "../src/data/eras";
import { getRoomDecorations } from "../src/data/room-decorations";

test("dev preview shows all four finished rooms without changing saved progress", async ({ page }) => {
  test.setTimeout(90000);
  const completedArtworkIds = [artworks.find(({ eraId }) => eraId === "era-1")!.id];
  await page.addInitScript((completedArtworkIds) => {
    if (localStorage.getItem("heritage-hearth-ui-v1")) return;
    localStorage.setItem("heritage-hearth-ui-v1", JSON.stringify({
      version: 1, state: { language: "pl", gentleMotion: true, completedArtworkIds },
    }));
  }, completedArtworkIds);
  await page.goto("/#era-1");
  await expect(page.locator(".room-status")).toContainText("1 / 21");
  const preview = page.getByRole("button", { name: "DEV: podgląd pokoju 9/9", exact: true });
  test.skip(await preview.count() === 0, "Run against npm run dev or build with NEXT_PUBLIC_ENABLE_DEV_TOOLS=1.");
  const saved = await page.evaluate(() => localStorage.getItem("heritage-hearth-ui-v1"));
  const positions = await page.locator(".wall-artwork").evaluateAll((slots) => slots.map((slot) => slot.getAttribute("style")));
  await expect(preview).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".unrestored-paper")).toHaveCount(4);
  await preview.click();
  await expect(preview).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".camera-controls")).toHaveCount(0);
  for (const era of eras) {
    if (era.id !== "era-1") await page.locator(".era-switcher").getByRole("button", { name: era.name.pl, exact: true }).click();
    await expect(page.locator(".room-backdrop")).toHaveAttribute("data-room-level", "9");
    await expect(page.locator(".game-viewport")).toHaveClass(/overview/);
    await expect(page.locator(".camera-controls")).toHaveCount(0);
    await expect(page.locator(".room-decoration")).toHaveCount(getRoomDecorations(era.id, 9).length);
    await expect(page.locator(".wall-artwork .original-artwork")).toHaveCount(5);
    await expect(page.locator(".unrestored-paper")).toHaveCount(0);
    await expect(page.locator(".decoration-unlock-toast")).toHaveCount(0);
    await expect(page.getByRole("progressbar", { name: "Rozwój pokoju", exact: true })).toHaveAttribute("aria-valuenow", "0");
    await expect.poll(() => page.locator(".room-decoration img, .wall-artwork img").evaluateAll((images) =>
      images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0),
    )).toBe(true);
    await page.screenshot({ path: `/tmp/museum-room-preview/${test.info().project.name}-${era.id}.png` });
  }
  expect(await page.evaluate(() => localStorage.getItem("heritage-hearth-ui-v1"))).toBe(saved);
  await page.locator(".era-switcher").getByRole("button", { name: "Wróć do holu", exact: true }).click();
  await expect(page.locator(".hall-canvas .scene-image")).toHaveAttribute("src", "/art/hall1.jpg");
  await expect(preview).toHaveCount(0);
  await page.getByRole("button", { name: eras[0].name.pl, exact: true }).first().click();
  await expect(preview).toHaveAttribute("aria-pressed", "true");
  await preview.click();
  await expect(page.locator(".room-backdrop")).toHaveAttribute("data-room-level", "0");
  await expect(page.getByRole("button", { name: "Pokaż całą scenę", exact: true })).toBeVisible();
  await expect(page.locator(".room-decoration")).toHaveCount(0);
  await expect(page.locator(".unrestored-paper")).toHaveCount(4);
  expect(await page.locator(".wall-artwork").evaluateAll((slots) => slots.map((slot) => slot.getAttribute("style")))).toEqual(positions);
  expect(await page.evaluate(() => localStorage.getItem("heritage-hearth-ui-v1"))).toBe(saved);
  await preview.click();
  await page.reload();
  await expect(preview).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".unrestored-paper")).toHaveCount(4);
  await page.getByRole("button", { name: "Switch to English", exact: true }).click();
  const englishPreview = page.getByRole("button", { name: "DEV: preview room 9/9", exact: true });
  await englishPreview.click();
  await expect(englishPreview).toHaveAttribute("aria-pressed", "true");
  await expect(englishPreview).toHaveText("DEV: exit preview 9/9");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("heritage-hearth-ui-v1")!).state.completedArtworkIds)).toEqual(completedArtworkIds);
  const box = (await englishPreview.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});
