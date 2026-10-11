import { test, expect } from "@playwright/test";
import { artworks, eras } from "../src/data/eras";
import curiosities from "../src/data/artworks_curiosities.json" with { type: "json" };
import metadata from "../src/data/artworks_qa.json" with { type: "json" };

test("painting and curiosity fit the screen before optionally opening the history", async ({ page }) => {
  const samples = [
    artworks.find((artwork) => artwork.title.pl.startsWith("Stańczyk"))!,
    artworks.find((artwork) => artwork.sourceFile === "era3_pozytywizm/07_07.jpg")!,
  ];
  await page.goto("/");
  for (const artwork of samples) {
    await page.evaluate((artwork) => {
      localStorage.setItem("heritage-hearth-ui-v1", JSON.stringify({
        version: 1,
        state: {
          language: "pl", gentleMotion: true, completedArtworkIds: [artwork.id],
          wallAssignments: { [`${artwork.eraId}-slot-1`]: artwork.id },
        },
      }));
    }, artwork);
    await page.goto(`/#${artwork.eraId}`);
    await page.reload();
    await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
    await page.getByRole("button", { name: `Historia obrazu — ${artwork.title.pl}`, exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Ciekawostka", exact: true })).toBeVisible();
    const image = dialog.locator(".story-preview img");
    await expect(image).toHaveAttribute("src", artwork.originalImage!);
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const history = dialog.locator(".story-history");
    await expect(dialog.locator(".story-body")).not.toBeVisible();
    for (const [width, height] of [[320, 568], [390, 720], [1440, 1000]]) {
      await page.setViewportSize({ width, height });
      const panel = (await dialog.boundingBox())!;
      for (const element of [image, dialog.locator(".fun-fact")]) {
        const box = (await element.boundingBox())!;
        expect(box.y).toBeGreaterThanOrEqual(panel.y);
        expect(box.y + box.height).toBeLessThanOrEqual(Math.min(panel.y + panel.height, height));
      }
    }
    await history.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(history).toHaveAttribute("open", "");
    await expect(dialog.locator(".story-body")).toBeVisible();
    await expect(dialog.locator(".story-body")).toHaveText(artwork.story!.pl);
    await page.keyboard.press("Enter");
    await expect(dialog.locator(".story-body")).not.toBeVisible();
    await page.keyboard.press("Escape");
  }
});

test("supplied titles, artists and stories work without losing saved progress", async ({ page }) => {
  const artwork = artworks.find((entry) => entry.sourceFile === "era1_oswiecenie/01_canaletto_warszawa_praga.jpg")!;
  const curiosity = curiosities.find((entry) => entry.filename === `assets/artworks/${artwork.sourceFile}`)!;
  const oldMetadata = metadata.find((entry) => entry.filename === curiosity.filename)!;
  await page.addInitScript((id) => {
    if (!localStorage.getItem("heritage-hearth-ui-v1")) localStorage.setItem("heritage-hearth-ui-v1", JSON.stringify({ version: 1, state: { completedArtworkIds: [id], gentleMotion: true } }));
  }, artwork.id);
  await page.goto("/#library");
  const search = page.getByRole("searchbox", { name: "Szukaj obrazu", exact: true });
  await search.fill("bellotto");
  await expect(page.locator(".library-artwork-card")).toHaveCount(7);
  await search.fill("widok warszawy od strony pragi");
  await expect(page.locator(".library-artwork-card")).toHaveCount(1);
  await expect(page.locator(".library-artwork-card")).toContainText("Bernardo Bellotto (Canaletto) · 1770");
  await page.getByRole("button", { name: "Widok Warszawy od strony Pragi — Oświecenie", exact: true }).click();
  await expect(page.locator(".library-detail h2")).toHaveText("Widok Warszawy od strony Pragi");
  await expect(page.locator(".library-detail .artwork-credit")).toHaveText("Bernardo Bellotto (Canaletto) · 1770");
  await page.getByLabel("Miejsce na ścianie", { exact: true }).selectOption("era-1-slot-5");
  await page.getByRole("button", { name: "Zawieś w pokoju", exact: true }).click();
  await expect(page.locator('[data-slot-id="era-1-slot-5"] .painting-frame')).toHaveAttribute("aria-label", "Widok Warszawy od strony Pragi — Odnowiony");
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: "Historia obrazu — Widok Warszawy od strony Pragi", exact: true }).click();
  await expect(page.locator(".story-body")).toHaveText(artwork.story!.pl);
  await expect(page.locator(".fun-fact p")).toHaveText(curiosity.curiosity);
  for (const pair of oldMetadata.qa_pairs) {
    await expect(page.getByRole("dialog")).not.toContainText(pair.question);
    await expect(page.getByRole("dialog")).not.toContainText(pair.answer);
  }
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Switch to English", exact: true }).click();
  await page.getByRole("button", { name: "The painting’s story — Widok Warszawy od strony Pragi", exact: true }).click();
  await expect(page.locator(".story-body")).toHaveAttribute("lang", "pl");
  await expect(page.locator(".fun-fact p")).toHaveText(curiosity.curiosity);
  await expect(page.locator(".fun-fact p")).toHaveAttribute("lang", "pl");
  await page.getByRole("button", { name: "Paint again", exact: true }).click();
  await expect(page.getByLabel("Painting: Widok Warszawy od strony Pragi", { exact: true })).toBeVisible();
  await expect(page.locator(".coloring-heading .artwork-credit")).toHaveText("Bernardo Bellotto (Canaletto) · 1770");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator('[data-slot-id="era-1-slot-5"] .painting-frame')).toHaveAttribute("aria-label", "Widok Warszawy od strony Pragi — Restored");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("heritage-hearth-ui-v1")!).state);
  expect(saved.completedArtworkIds).toEqual([artwork.id]);
  expect(saved.wallAssignments["era-1-slot-5"]).toBe(artwork.id);
});

test("landing page opens all uploaded paintings, era filters and search", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".camera-controls")).toHaveCount(0);
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
  await expect(page.getByRole("button", { name: "Otwórz pracownię", exact: true })).toBeVisible();
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
  await page.getByRole("button", { name: `Historia obrazu — ${collection[5].title.pl}`, exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(collection[5].title.pl);
});

test("library works in English, survives browser back and fits a 320px phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await page.locator(".home-library-button").click();
  await page.getByRole("button", { name: "Switch to English", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Painting library");
  await page.locator(".library-era-filters").getByRole("button", { name: "Romanticism", exact: true }).click();
  const lastRomantic = artworks.filter((artwork) => artwork.eraId === "era-2").at(-1)!;
  await page.getByRole("button", { name: `${lastRomantic.title.en} — Romanticism`, exact: true }).click();
  await expect(page.getByRole("button", { name: "Open the studio", exact: true })).toBeVisible();
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
  const artwork = artworks.filter((entry) => entry.eraId === "era-1")[5];
  await page.getByRole("button", { name: `${artwork.title.pl} — Oświecenie`, exact: true }).click();
  await expect(page.locator(".library-detail-image .library-image-fallback")).toBeVisible();
  await page.getByRole("button", { name: "Zawieś w pokoju", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Oświecenie");
  await expect(page.locator('[data-slot-id="era-1-slot-1"] .unrestored-paper')).toBeVisible();
});
