import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { seedGame } from "./helpers/game-state";
import { copy } from "../src/data/copy";
import { artworks } from "../src/data/eras";
import { fillCanvas } from "./helpers/catalog-coloring";

for (const scene of ["home","hall","era-1","studio","library","album","detail","settings","info","locked","milestone"]) {
  test(`WCAG 2.2 AA: ${scene}`, async ({page},info) => {
    await page.emulateMedia({reducedMotion:"reduce"});
    if(scene !== "locked") await seedGame(page, scene === "milestone" ? {exploreAll:false,completedArtworkIds:artworks.filter(a=>a.eraId==="era-1" && a.id!==artworks[0].id).map(a=>a.id)} : {});
    const hash = ["studio","milestone"].includes(scene) ? "era-1" : ["settings","info"].includes(scene) ? "home" : scene === "locked" ? "hall" : ["detail","album"].includes(scene) ? "library" : scene;
    await page.goto(`/#${hash}`);
    await expect(page.locator(".site-header")).toBeVisible();
    if(scene === "info") { await page.getByRole("button",{name:copy.pl.settings,exact:true}).click();await page.getByRole("dialog").getByRole("button",{name:copy.pl.info,exact:true}).click(); }
    if(scene === "settings") await page.getByRole("button",{name:"Ustawienia",exact:true}).click();
    if(scene === "locked") await page.locator('.hall-door-hit[data-era="era-2"]').click();
    if(scene === "album") await page.getByRole("button",{name:"Album",exact:true}).click();
    if(scene === "detail") await page.locator(".library-artwork-card").first().click();
    if(scene === "studio" || scene === "milestone") {
      await page.locator(".painting-frame").first().click();
      await expect(page.locator(".coloring-canvas")).toBeVisible();
      if(scene === "milestone") {
        await fillCanvas(page);
        await page.getByRole("button",{name:"Odkryj opowieść",exact:true}).click();
        await page.getByRole("button",{name:"Wróć do pokoju",exact:true}).click();
        await expect(page.locator(".progress-notice")).toBeVisible();
      }
    }
    const results = await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
    await info.attach("axe",{body:JSON.stringify(results),contentType:"application/json"});
    expect(results.violations.filter(v=>v.impact === "serious" || v.impact === "critical").map(v=>({id:v.id,description:v.description,targets:v.nodes.map(n=>n.target)}))).toEqual([]);
  });
}
