import { test, expect } from "@playwright/test";
import { artworks, eras } from "../src/data/eras";

test("home, hall, four rooms, stories and browser back work", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Przywróć kolor",
  );
  await page
    .getByRole("button", { name: "Otwórz drzwi", exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Hol");
  const rooms = [
    "Oświecenie",
    "Romantyzm",
    "Pozytywizm",
    "Młoda Polska",
  ];
  for (let index = 0; index < rooms.length; index++) {
    await page
      .getByRole("navigation", { name: "Pokoje" })
      .last()
      .getByRole("button", { name: rooms[index], exact: true })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      rooms[index],
    );
    await expect(
      page.getByRole("button", { name: / — Czeka na kolory$/ }),
    ).toHaveCount(5);
  }
  await page
    .getByRole("button", { name: "Historia obrazu — Obraz 01", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Ciekawostka" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(rooms[2]);
  await page
    .getByRole("button", {
      name: "Następna epoka: Młoda Polska",
      exact: true,
    })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(rooms[3]);
  await page
    .getByRole("button", { name: "Obraz 01 — Czeka na kolory", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Pracownia będzie wkrótce gotowa",
  );
  expect(errors).toEqual([]);
});

test("language, reduced motion, progress and deep links survive reload", async ({
  page,
}) => {
  await page.goto("/#era-2");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Romantyzm",
  );
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("switch", { name: "Gentle animations" }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Romanticism",
  );
  await expect(page.locator(".heritage-app")).toHaveClass(/gentle-motion/);
  await page.evaluate((completedIds) => {
    const key = "heritage-hearth-ui-v1";
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.state.completedArtworkIds = completedIds;
    localStorage.setItem(key, JSON.stringify(saved));
  }, artworks.filter((artwork) => artwork.eraId === "era-1").map((artwork) => artwork.id));
  await page.goto("/#home");
  await page.reload();
  await expect(page.locator(".home-canvas > img")).toHaveAttribute(
    "src",
    "/art/house1.jpg",
  );
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await expect(
    page.getByText("Delete the saved progress on this device?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".home-canvas > img")).toHaveAttribute(
    "src",
    "/art/house0.jpg",
  );
});

test("blocked storage and a missing scene image keep navigation usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
  });
  await page.route("**/art/room1.jpg", (route) => route.abort());
  await page.goto("/#era-1");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Oświecenie",
  );
  await expect(
    page.getByText("Ta ilustracja jest chwilowo niedostępna."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("status")).toContainText("Saving is unavailable");
  await page
    .getByRole("button", { name: "Next era: Romanticism", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Romanticism",
  );
});

test("narrow phones fill the screen and can pan or show the entire room", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/#era-4");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Młoda Polska",
  );
  await expect(page.locator(".room-canvas")).toBeVisible();
  const dimensions = await page
    .locator(".scene-canvas")
    .evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
  expect(dimensions.overflow).toBe(false);
  expect(dimensions.width / dimensions.height).toBeCloseTo(896 / 1200, 2);
  const viewport = page.locator(".game-viewport");
  await expect(viewport).toHaveCSS("border-radius", "0px");
  expect(await viewport.boundingBox()).toMatchObject({
    x: 0,
    y: 0,
    width: 320,
    height: 700,
  });
  const before = await viewport.evaluate((element) => element.scrollLeft);
  await page
    .getByRole("button", { name: "Przesuń widok w prawo", exact: true })
    .click();
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(before);
  await page
    .getByRole("button", { name: "Pokaż całą scenę", exact: true })
    .click();
  await expect(viewport).toHaveClass(/overview/);
  for (const door of await page.locator(".room-door-hit").all()) {
    const box = await door.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(700);
  }
  await page
    .getByRole("button", { name: "Wypełnij ekran sceną", exact: true })
    .click();
  await expect(viewport).not.toHaveClass(/overview/);
  await page.setViewportSize({ width: 700, height: 320 });
  await expect
    .poll(async () => (await viewport.boundingBox())?.width)
    .toBe(700);
  expect(await viewport.boundingBox()).toMatchObject({
    x: 0,
    y: 0,
    width: 700,
    height: 320,
  });
  await expect(
    page.getByRole("button", { name: "Przesuń widok w dół", exact: true }),
  ).toBeVisible();
});

for (const completedRooms of [0, 1, 2, 3, 4]) {
  test(`hall illustration and four doors work after ${completedRooms} restored rooms`, async ({ page }) => {
    await page.addInitScript((completedArtworkIds) => {
      localStorage.setItem(
        "heritage-hearth-ui-v1",
        JSON.stringify({
          version: 1,
          state: { language: "pl", completedArtworkIds },
        }),
      );
    }, artworks.filter((artwork) => eras.slice(0, completedRooms).some((era) => era.id === artwork.eraId)).map((artwork) => artwork.id));
    await page.goto("/#hall");
    const stage = Math.min(completedRooms + 1, 4);
    const hallImage = page.locator(".hall-canvas > img");
    await expect(hallImage).toHaveAttribute("src", `/art/hall${stage}.jpg`);
    await expect.poll(() => hallImage.evaluate((image) =>
      (image as HTMLImageElement).naturalWidth,
    )).toBe(896);
    const rooms = [
      "Oświecenie",
      "Romantyzm",
      "Pozytywizm",
      "Młoda Polska",
    ];
    for (let index = 0; index < rooms.length; index++) {
      await page.getByRole("button", { name: "Pokaż całą scenę", exact: true }).click();
      const door = page.locator(`.hall-door-hit[data-era="era-${index + 1}"]`);
      const box = await door.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      await door.click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(rooms[index]);
      await expect(page.locator(".room-canvas")).toBeVisible();
      await page.locator(".back-button").click();
      await expect(hallImage).toHaveAttribute("src", `/art/hall${stage}.jpg`);
    }
  });
}

test("mouse dragging the scene does not open a painting", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#era-1");
  await expect(page.locator(".room-canvas")).toBeVisible();
  const viewport = page.locator(".game-viewport");
  await expect(
    page.getByRole("button", { name: "Przesuń widok w prawo", exact: true }),
  ).toBeVisible();
  const before = await viewport.evaluate((element) => element.scrollLeft);
  const painting = await page
    .getByRole("button", { name: "Obraz 03 — Czeka na kolory", exact: true })
    .boundingBox();
  expect(painting).not.toBeNull();
  const startX = painting!.x + painting!.width / 2;
  const startY = painting!.y + painting!.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 80, startY, { steps: 8 });
  await page.mouse.up();
  expect(await viewport.evaluate((element) => element.scrollLeft)).toBeLessThan(
    before,
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("fullscreen dialogs and resizing keep the interface anchored", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Pełny ekran", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
    .toBe(true);
  await page.getByRole("button", { name: "Ustawienia", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((element) =>
      Boolean(element.closest(".heritage-app")),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Zamknij", exact: true }).click();
  await page
    .getByRole("button", { name: "Wyjdź z pełnego ekranu", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
    .toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => (await page.locator(".site-header").boundingBox())?.x)
    .toBe(12);
  expect(await page.locator(".site-header").boundingBox()).toMatchObject({
    x: 12,
    y: 12,
  });
  expect(await page.locator(".game-viewport").boundingBox()).toMatchObject({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
  });
});
