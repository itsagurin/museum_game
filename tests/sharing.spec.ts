import {test,expect} from "@playwright/test";
import sharp from "sharp";
import {mkdir} from "node:fs/promises";
import {artworks} from "../src/data/eras";
import {seedGame} from "./helpers/game-state";
import {catalogPaintings,openCatalogStudio,fillCanvas} from "./helpers/catalog-coloring";
test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.addInitScript(()=>Object.defineProperty(navigator,"canShare",{value:()=>false}));
});
for(const kind of ["card","certificate"] as const) {
 test(`downloads a local ${kind} PNG with the requested dimensions`,async({page},info)=>{
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));page.on("console",message=>{if(message.type()==="error")errors.push(message.text());});
  if(kind==="certificate") await seedGame(page,{completedArtworkIds:artworks.slice(1).map(a=>a.id)});
  await openCatalogStudio(page,catalogPaintings[0]);await fillCanvas(page);
  await page.getByRole("button",{name:"Odkryj opowieść",exact:true}).click();
  if(kind==="certificate") {
    await page.getByRole("button",{name:"Wróć do pokoju",exact:true}).click();
    await expect(page.getByRole("dialog")).toContainText("Dom jest gotowy");
    await page.getByLabel("Imię (opcjonalnie, tylko na certyfikacie)",{exact:true}).fill("Gość");
  }
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:kind==="card" ? "Udostępnij" : "Pobierz certyfikat",exact:true}).click();
  const download=await downloadPromise,metadata=await sharp((await download.path())!).metadata();
  await mkdir("/tmp/museum-b4",{recursive:true});await download.saveAs(`/tmp/museum-b4/${info.project.name}-${kind}.png`);
  expect([metadata.width,metadata.height]).toEqual(kind==="card" ? [1080,1350] : [1754,1240]);
  expect(errors).toEqual([]);
  if(kind==="certificate") expect(await page.evaluate(()=>localStorage.getItem("heritage-hearth-ui-v1"))).not.toContain("Gość");
 });
}
