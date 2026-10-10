import { test, expect } from "@playwright/test";
import manifest from "../src/data/asset-manifest.json" with { type: "json" };
import { artworks } from "../src/data/eras";
import { getRoomBackgroundCandidates } from "../src/lib/room-development";

test("room levels survive reload, use earned assets and reset without moving the walls", async ({ page }) => {
  await page.addInitScript((completedIds) => {
    if (localStorage.getItem("heritage-hearth-ui-v1")) return;
    localStorage.setItem("heritage-hearth-ui-v1", JSON.stringify({
      version: 1,
      state: { language: "pl", gentleMotion: true, completedArtworkIds: [...completedIds, completedIds[0], "unknown"] },
    }));
  }, artworks.filter((artwork) => artwork.eraId === "era-3").slice(0, 8).map((artwork) => artwork.id));
  await page.goto("/#era-3");
  const progress = page.getByRole("progressbar", { name: "Rozwój pokoju", exact: true });
  await expect(progress).toHaveAttribute("aria-valuenow", "3");
  await expect(page.locator(".room-status")).toContainText("8 / 22");
  await expect(page.locator(".room-backdrop")).toHaveAttribute("data-room-level", "3");
  await expect(page.locator(".room-canvas .scene-image").last()).toHaveAttribute("src", `/art/${getRoomBackgroundCandidates("room3.jpg", 3, manifest)[0]}`);
  await expect(page.locator(".wall-artwork")).toHaveCount(5);
  const positions = await page.locator(".wall-artwork").evaluateAll((slots) => slots.map((slot) => slot.getAttribute("style")));
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: "Historia obrazu — Obraz 03", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Ciekawostka");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(progress).toHaveAttribute("aria-valuenow", "3");
  await expect(page.locator(".wall-artwork")).toHaveCount(5);
  await page.getByRole("button", { name: "Switch to English", exact: true }).click();
  await expect(page.getByRole("progressbar", { name: "Room development", exact: true })).toHaveAttribute("aria-valuetext", "Level 3 / 9");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Reset progress", exact: true }).click();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("progressbar", { name: "Room development", exact: true })).toHaveAttribute("aria-valuenow", "0");
  await expect(page.locator(".room-status")).toContainText("0 / 22");
  await expect(page.locator(".room-canvas .scene-image").last()).toHaveAttribute("src", `/art/${getRoomBackgroundCandidates("room3.jpg", 0, manifest)[0]}`);
  expect(await page.locator(".wall-artwork").evaluateAll((slots) => slots.map((slot) => slot.getAttribute("style")))).toEqual(positions);
  const box = (await page.locator(".room-status").boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("broken room images leave level progress and wall interactions available", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/art/room*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", (route) => route.abort());
  await page.goto("/#era-1");
  await expect(page.locator(".room-backdrop .image-fallback")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Rozwój pokoju", exact: true })).toHaveAttribute("aria-valuenow", "0");
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: "Historia obrazu — Obraz 01", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Ciekawostka");
  expect(errors).toEqual([]);
});
