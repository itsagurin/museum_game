import { test, expect } from "@playwright/test";
import { copy } from "../src/data/copy";
import { artworks } from "../src/data/eras";
import { ERA_UNLOCK_LEVEL, getLevelThresholds } from "../src/lib/room-development";
import { catalogPaintings, fillCanvas, openCatalogStudio } from "./helpers/catalog-coloring";
import { seedGame } from "./helpers/game-state";

const firstEra = artworks.filter((artwork) => artwork.eraId === "era-1");
// The last painting of the era does not hang on the wall at the start.
const romantic = artworks.filter((artwork) => artwork.eraId === "era-2").at(-1)!;
const unlockAt = getLevelThresholds(firstEra.length)[ERA_UNLOCK_LEVEL - 1];
const first = catalogPaintings[0];

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); });

test("a new game opens only the first era and explains every locked entrance", async ({ page }) => {
  await page.goto("/#hall");
  await expect(page.locator(".hall-door-hit.locked")).toHaveCount(3);
  await page.locator('.hall-door-hit[data-era="era-2"]').click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(copy.pl.lockedBody("Romantyzm", "w Oświeceniu", unlockAt));
  await dialog.getByRole("button", { name: copy.pl.lockedGo("w Oświeceniu"), exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Oświecenie");

  await page.getByRole("button", { name: "Następna epoka: Romantyzm — zamknięte", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(copy.pl.lockedTitle);
  await page.keyboard.press("Escape");

  // Typed or bookmarked addresses cannot skip the order, and the redirect stays out of history.
  await page.goto("/#era-3");
  await expect(page).toHaveURL(/#hall$/);
  await expect(page.getByRole("dialog")).toContainText(copy.pl.lockedBody("Pozytywizm", "w Romantyzmie", 0));
  await page.keyboard.press("Escape");

  await page.goto("/#library");
  await page.getByRole("button", { name: `${romantic.title.pl} — Romantyzm`, exact: true }).click();
  await expect(page.getByRole("button", { name: "Otwórz pracownię", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Zawieś w pokoju", exact: true })).toBeDisabled();
  await expect(page.locator(".library-locked-hint")).toContainText(copy.pl.libraryLocked("w Oświeceniu"));
});

test(`level ${ERA_UNLOCK_LEVEL} in an era opens the next one with a notice, once`, async ({ page }) => {
  await seedGame(page, { exploreAll: false, gentleMotion: true, completedArtworkIds: firstEra.slice(1, unlockAt).map(({ id }) => id) });
  await page.goto("/#era-1");
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: `${first.artwork.title.pl} — Czeka na kolory`, exact: true }).click();
  await fillCanvas(page);
  await page.getByRole("button", { name: "Odkryj opowieść", exact: true }).click();
  await page.getByRole("button", { name: "Wróć do pokoju", exact: true }).click();
  const notice = page.getByRole("dialog");
  await expect(notice.getByRole("heading", { name: copy.pl.unlockTitle, exact: true })).toBeVisible();
  await notice.getByRole("button", { name: copy.pl.enterEra("Romantyzm"), exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Romantyzm");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Romantyzm");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a started painting survives leaving the studio and a reload, with numbers when zoomed", async ({ page }) => {
  await seedGame(page, {exploreAll:false});
  await page.goto("/#era-1");
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: `${first.artwork.title.pl} — Czeka na kolory`, exact: true }).click();
  await page.getByRole("group", { name: "Wybierz kolor", exact: true }).getByRole("button").first().click();
  // Three strokes stay below the five-in-a-row automatic fill.
  for (let stroke = 0; stroke < 3; stroke++) await page.locator(".pixel-hit.matching:not(.painted)").first().press("Enter");
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(3);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("heritage-paintings-v1") ?? "{}").state?.paintings ?? {}))).toEqual([first.artwork.id]);

  await page.reload();
  await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
  await page.getByRole("button", { name: `${first.artwork.title.pl} — W trakcie 1%`, exact: true }).click();
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(3);
  await expect(page.locator(".pixel-number")).toHaveCount(0);
  await page.getByRole("button", { name: "Powiększ płótno", exact: true }).click();
  await expect(page.locator(".pixel-number")).toHaveCount(first.painting.grid.width * first.painting.grid.height - 3);

  await fillCanvas(page);
  await page.getByRole("button", { name: "Odkryj opowieść", exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("heritage-paintings-v1")!).state.paintings)).toEqual({});
});

test("exploration mode opens every era from the settings", async ({ page }) => {
  await page.goto("/#hall");
  await page.getByRole("button", { name: "Ustawienia", exact: true }).click();
  await page.getByRole("switch", { name: "Otwórz wszystkie epoki" }).click();
  await page.getByRole("button", { name: "Zamknij", exact: true }).click();
  await expect(page.locator(".hall-door-hit.locked")).toHaveCount(0);
  await page.locator('.hall-door-hit[data-era="era-4"]').click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Młoda Polska");
});

test("undo starts disabled after resuming and becomes available after a new stroke", async ({page}) => {
  const entry = catalogPaintings[0];
  await openCatalogStudio(page, entry);
  await page.locator(".paint-brush").first().click();
  await page.locator(".pixel-hit.matching").first().press("Enter");
  await page.keyboard.press("Escape");
  await page.reload();
  await openCatalogStudio(page, entry);
  await expect(page.getByRole("button", {name:"Cofnij",exact:true})).toBeDisabled();
  await page.locator(".paint-brush").first().click();
  await page.locator(".pixel-hit.matching:not(.painted)").first().press("Enter");
  await expect(page.getByRole("button", {name:"Cofnij",exact:true})).toBeEnabled();
});
