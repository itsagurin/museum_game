import { test, expect } from "@playwright/test";
import { artworks, eras } from "../src/data/eras";

test("landing page opens all uploaded paintings, era filters and search", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const camera = (await page.locator(".camera-controls").boundingBox())!;
  const homeActions = (await page.locator(".home-actions").boundingBox())!;
  expect(camera.y + camera.height).toBeLessThanOrEqual(homeActions.y);
  await page.locator(".home-library-button").click();
  await expect(page).toHaveURL(/#library$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Biblioteka obrazów");
  await expect(page.locator(".library-artwork-card")).toHaveCount(83);
  for (const [index, era] of eras.entries()) {
    await page.locator(".library-era-filters").getByRole("button", { name: era.name.pl, exact: true }).click();
    await expect(page.locator(".library-artwork-card")).toHaveCount([21, 18, 22, 22][index]);
    expect(await page.locator(".library-card-image img").evaluateAll((images, eraNumber) => images.every((image) => image.getAttribute("src")!.startsWith(`/art/era${eraNumber}_`)), index + 1)).toBe(true);
  }
  await page.locator(".library-era-filters").getByRole("button", { name: "Wszystkie", exact: true }).click();
  await page.getByRole("searchbox", { name: "Szukaj obrazu", exact: true }).fill("mloda polska");
  await expect(page.locator(".library-artwork-card")).toHaveCount(22);
  await page.getByRole("searchbox", { name: "Szukaj obrazu", exact: true }).fill("nieistniejący obraz");
  await expect(page.locator(".library-empty")).toBeVisible();
  await page.getByRole("button", { name: "Wyczyść wyszukiwanie", exact: true }).click();
  await expect(page.locator(".library-artwork-card")).toHaveCount(83);
  await page.getByRole("button", { name: "Odnowione", exact: true }).click();
  await expect(page.locator(".library-artwork-card")).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const era of eras) test(`${era.name.pl}: room picker stays in its era and saves an unpainted replacement`, async ({ page }) => {
  const collection = artworks.filter((artwork) => artwork.eraId === era.id);
  const replacement = collection.at(-1)!;
  await page.goto(`/#${era.id}`);
  await page.getByRole("button", { name: "Zmień obrazy", exact: true }).click();
  await expect(page.locator(".library-era-filters")).toHaveCount(0);
  await expect(page.locator(".library-artwork-card")).toHaveCount(collection.length);
  await page.getByRole("button", { name: `${replacement.title.pl} — ${era.name.pl}`, exact: true }).click();
  await expect(page.getByRole("button", { name: "Wróć do kolekcji", exact: true })).toBeFocused();
  await page.getByLabel("Miejsce na ścianie", { exact: true }).selectOption(`${era.id}-slot-3`);
  await expect(page.locator(".library-detail")).toContainText("Do ukończenia kolorowania");
  await expect(page.locator(".library-detail")).toContainText("Pracownia tego obrazu będzie dostępna wkrótce");
  await page.getByRole("button", { name: "Zawieś w pokoju", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(era.name.pl);
  const frame = page.locator(`[data-slot-id="${era.id}-slot-3"]`);
  await expect(frame.getByRole("button", { name: `${replacement.title.pl} — Czeka na kolory`, exact: true })).toBeVisible();
  await expect(frame.locator(".unrestored-paper")).toHaveCount(1);
  await expect(frame.locator(".original-artwork")).toHaveCount(0);
  await expect(page.getByRole("progressbar", { name: "Rozwój pokoju", exact: true })).toHaveAttribute("aria-valuenow", "0");
  await page.reload();
  await expect(frame.getByRole("button", { name: `${replacement.title.pl} — Czeka na kolory`, exact: true })).toHaveCount(1);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("heritage-hearth-ui-v1")!).state);
  expect(saved.wallAssignments[`${era.id}-slot-3`]).toBe(replacement.id);
  expect(saved.completedArtworkIds).toEqual([]);
});

test("occupied paintings swap positions without changing completion, and restored paintings open their era picker", async ({ page }) => {
  const era = eras[0];
  const collection = artworks.filter((artwork) => artwork.eraId === era.id);
  await page.addInitScript((completedId) => localStorage.setItem("heritage-hearth-ui-v1", JSON.stringify({ version: 1, state: { completedArtworkIds: [completedId], gentleMotion: true } })), collection[0].id);
  await page.goto("/#era-1");
  await page.getByRole("button", { name: "Zmień obrazy", exact: true }).click();
  await page.getByRole("button", { name: `${collection[1].title.pl} — Oświecenie`, exact: true }).click();
  await expect(page.locator(".library-detail")).toContainText("zamieni oba obrazy");
  await page.getByRole("button", { name: "Zawieś w pokoju", exact: true }).click();
  await expect(page.locator('[data-slot-id="era-1-slot-1"] .painting-frame')).toHaveAttribute("aria-label", `${collection[1].title.pl} — Czeka na kolory`);
  await expect(page.locator('[data-slot-id="era-1-slot-2"] .painting-frame')).toHaveAttribute("aria-label", `${collection[0].title.pl} — Odnowiony`);
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.locator('[data-slot-id="era-1-slot-2"] .painting-frame').click();
  await expect(page.locator(".library-artwork-card")).toHaveCount(21);
  await page.getByRole("button", { name: `${collection[5].title.pl} — Oświecenie`, exact: true }).click();
  await expect(page.getByLabel("Miejsce na ścianie", { exact: true })).toHaveValue("era-1-slot-2");
  await page.getByRole("button", { name: "Zawieś w pokoju", exact: true }).click();
  await expect(page.locator('[data-slot-id="era-1-slot-2"] .painting-frame')).toHaveAttribute("aria-label", `${collection[5].title.pl} — Czeka na kolory`);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("heritage-hearth-ui-v1")!).state.completedArtworkIds)).toEqual([collection[0].id]);
  await expect(page.locator(".room-status")).toContainText("1 / 21");
  await page.getByRole("button", { name: "Historia obrazu — Obraz 06", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Obraz 06");
});

test("library works in English, survives browser back and fits a 320px phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await page.locator(".home-library-button").click();
  await page.getByRole("button", { name: "Switch to English", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Painting library");
  await page.locator(".library-era-filters").getByRole("button", { name: "Romanticism", exact: true }).click();
  await page.getByRole("button", { name: "Painting 18 — Romanticism", exact: true }).click();
  await expect(page.locator(".library-detail")).toContainText("available soon");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByLabel("Wall position", { exact: true })).toHaveValue("era-2-slot-1");
  await page.getByRole("button", { name: "Back to the collection", exact: true }).click();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Bring colour back");
  await page.goForward();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Painting library");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".library-artwork-card")).toHaveCount(83);
});

test("unavailable reproduction does not prevent choosing a wall position", async ({ page }) => {
  await page.route("**/art/era1_oswiecenie/**", (route) => route.abort());
  await page.goto("/#library");
  await page.getByRole("button", { name: "Obraz 06 — Oświecenie", exact: true }).click();
  await expect(page.locator(".library-detail-image .library-image-fallback")).toBeVisible();
  await page.getByRole("button", { name: "Zawieś w pokoju", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Oświecenie");
  await expect(page.locator('[data-slot-id="era-1-slot-1"] .unrestored-paper')).toBeVisible();
});
