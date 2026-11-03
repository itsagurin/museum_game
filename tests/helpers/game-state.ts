import type { Page } from "@playwright/test";

export const gameStorageKey = "heritage-hearth-ui-v1";

/**
 * Seeds the save once per test (a reload keeps what the test changed). Most tests visit every
 * room directly, so the default opens all eras, like the "Otwórz wszystkie epoki" setting.
 */
export async function seedGame(page: Page, state: Record<string, unknown> = {}) {
  await page.addInitScript(({ key, state }) => {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, JSON.stringify({ version: 1, state: { language: "pl", tutorialSeen: true, exploreAll: true, ...state } }));
  }, { key: gameStorageKey, state });
}
