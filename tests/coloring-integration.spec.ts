import { test, expect, type Page } from "@playwright/test";
import database from "../src/data/artworks_db.json" with { type: "json" };
import { artworks, eras } from "../src/data/eras";

// Uploaded reproductions need explicit grid bindings from the painter's author.
const connected = artworks.flatMap((artwork) => {
  const painting = database.find((entry) => entry.id === artwork.coloringArtworkId);
  return painting ? [{ artwork, painting }] : [];
});

async function openConnected(page: Page, entry: (typeof connected)[number]) {
  await page.goto("/#library");
  const era = eras.find((era) => era.id === entry.artwork.eraId)!;
  await page.getByRole("button", { name: `${entry.artwork.title.pl} — ${era.name.pl}`, exact: true }).click();
  await page.getByRole("button", { name: "Otwórz pracownię", exact: true }).click();
  return page.getByLabel(`Kolorowanie: ${entry.painting.title}`, { exact: true });
}

test("unbound catalog paintings show the pending studio without awarding progress", async ({ page }) => {
  test.skip(artworks.every((artwork) => artwork.coloringArtworkId), "All catalog entries now have painting grids.");
  for (const era of eras) {
    const unbound = artworks.find((artwork) => artwork.eraId === era.id && !artwork.coloringArtworkId);
    if (!unbound) continue;
    await page.goto("/#library");
    await page.getByRole("button", { name: `${unbound.title.pl} — ${era.name.pl}`, exact: true }).click();
    await expect(page.locator(".library-detail")).toContainText("Pracownia tego obrazu będzie dostępna wkrótce");
    await expect(page.getByRole("button", { name: "Otwórz pracownię", exact: true })).toHaveCount(0);
    const first = artworks.find((artwork) => artwork.eraId === era.id)!;
    if (!first.coloringArtworkId) {
      await page.goto(`/#${era.id}`);
      await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
      await page.getByRole("button", { name: `${first.title.pl} — Czeka na kolory`, exact: true }).click();
      await expect(page.getByRole("dialog")).toContainText("Pracownia będzie wkrótce gotowa");
      await expect(page.locator(".pixel-hit")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Odkryj opowieść", exact: true })).toHaveCount(0);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("progressbar", { name: "Rozwój pokoju", exact: true })).toHaveAttribute("aria-valuenow", "0");
    }
  }
  const completed = await page.evaluate(() => JSON.parse(localStorage.getItem("heritage-hearth-ui-v1") ?? '{"state":{}}').state.completedArtworkIds ?? []);
  expect(completed).toEqual([]);
});

test("English pending studio and browser back keep room navigation connected", async ({ page }) => {
  const unbound = artworks.find((artwork) => !artwork.coloringArtworkId);
  test.skip(!unbound, "All catalog entries now have painting grids.");
  const era = eras.find((era) => era.id === unbound!.eraId)!;
  await page.goto("/#hall");
  await page.getByRole("navigation", { name: "Pokoje" }).last().getByRole("button", { name: era.name.pl, exact: true }).click();
  await page.getByRole("button", { name: "Switch to English", exact: true }).click();
  await page.getByRole("button", { name: "Show the whole scene", exact: true }).click();
  await page.getByRole("button", { name: `${unbound!.title.en} — Waiting for colour`, exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("The studio will be ready soon");
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hall");
});

test("explicitly connected catalog paintings render their exact supplied grids", async ({ page }) => {
  test.skip(!connected.length, "No uploaded reproduction has a coloring grid binding yet.");
  for (const entry of connected) {
    const canvas = await openConnected(page, entry);
    await expect(canvas.locator(".pixel-hit")).toHaveCount(entry.painting.grid.width * entry.painting.grid.height);
    expect(await canvas.locator(".pixel-hit").evaluateAll((pixels) => pixels.map((pixel) => Number(pixel.getAttribute("data-color-id"))))).toEqual(entry.painting.grid.data.flat());
    for (const color of entry.painting.palette) {
      await expect(page.getByRole("button", { name: `Kolor ${color.id}: ${color.name}`, exact: true })).toHaveAttribute("data-color-id", String(color.id));
    }
    await expect(page.getByRole("button", { name: "Dokończ swoje płótno", exact: true })).toBeDisabled();
    expect(await page.getByRole("dialog").boundingBox()).toMatchObject({ x: 0, y: 0, ...page.viewportSize()! });
    await page.keyboard.press("Escape");
  }
});

test("completing a connected painting saves its catalog identity without duplicates", async ({ page }) => {
  test.skip(!connected.length, "No uploaded reproduction has a coloring grid binding yet.");
  const entry = connected[0];
  const canvas = await openConnected(page, entry);
  for (const color of entry.painting.palette) {
    await page.getByRole("button", { name: `Kolor ${color.id}: ${color.name}`, exact: true }).click();
    await canvas.locator(".pixel-hit.matching:not(.painted)").evaluateAll((pixels) => {
      for (const pixel of pixels) pixel.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
  }
  await expect(page.getByRole("button", { name: "Odkryj opowieść", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Odkryj opowieść", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await page.getByRole("button", { name: "Wróć do pokoju", exact: true }).click();
  await page.reload();
  const completed = await page.evaluate(() => JSON.parse(localStorage.getItem("heritage-hearth-ui-v1")!).state.completedArtworkIds);
  expect(completed).toEqual([entry.artwork.id]);
  await page.getByRole("button", { name: `${entry.artwork.title.pl} — ${eras.find((era) => era.id === entry.artwork.eraId)!.name.pl}`, exact: true }).click();
  await expect(page.locator(".library-state")).toContainText("Odnowiony");
});
