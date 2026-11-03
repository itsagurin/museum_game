import { test, expect } from "@playwright/test";
import { artworks } from "../src/data/eras";
import { seedGame } from "./helpers/game-state";

test("deep links never insert the home scene before hydration", async ({page}) => {
  await seedGame(page);
  await page.addInitScript(() => {
    (window as unknown as { flashes: string[] }).flashes = [];
    new MutationObserver(() => {
      if (document.querySelector(".home-canvas")) (window as unknown as { flashes: string[] }).flashes.push("home");
    }).observe(document,{childList:true,subtree:true});
  });
  for (const hash of ["era-1","library"]) {
    await page.goto(`/#${hash}`);
    await expect(page.locator(hash === "library" ? ".library-scroll" : ".room-canvas")).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { flashes: string[] }).flashes)).toEqual([]);
  }
});
test("returning players never see a lock on their open second era", async ({page}) => {
  await seedGame(page,{exploreAll:false,completedArtworkIds:artworks.filter(a=>a.eraId === "era-1").map(a=>a.id)});
  await page.addInitScript(() => {
    (window as unknown as { sawLock: boolean }).sawLock = false;
    new MutationObserver(() => {
      if(document.querySelector('.hall-door-hit.locked[data-era="era-2"]')) (window as unknown as { sawLock: boolean }).sawLock = true;
    }).observe(document,{childList:true,subtree:true,attributes:true});
  });
  await page.goto("/#hall");
  await expect(page.locator('.hall-door-hit[data-era="era-2"]')).not.toHaveClass(/locked/);
  expect(await page.evaluate(() => (window as unknown as { sawLock: boolean }).sawLock)).toBe(false);
});
test("stale painting percentages are removed before a room opens", async ({page}) => {
  await page.addInitScript(id => localStorage.setItem("heritage-paintings-v1", JSON.stringify({version:1,state:{paintings:{[id]:{signature:"outdated",total:1024,painted:8,cells:"AA==",updatedAt:1}}}})),artworks[0].id);
  await page.goto("/#era-1");
  await expect(page.locator(".room-canvas")).toBeVisible();
  await expect(page.locator(".paper-progress")).toHaveCount(0);
});
