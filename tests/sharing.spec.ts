import {test,expect} from "@playwright/test";
import sharp from "sharp";
import {mkdir} from "node:fs/promises";
import {artworks} from "../src/data/eras";
import {seedGame} from "./helpers/game-state";
import {copy} from "../src/data/copy";
import {coloringCopy} from "../src/data/coloring-copy";
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

test("an English certificate waits for a Polish name's font and keeps the name local",async({page},info)=>{
 const name="Gość Żółć",t=copy.en;
 await seedGame(page,{language:"en",completedArtworkIds:artworks.slice(1).map(artwork=>artwork.id)});
 await openCatalogStudio(page,catalogPaintings[0],"en");await fillCanvas(page,"en");
 await page.getByRole("button",{name:coloringCopy.en.discover,exact:true}).click();
 await page.getByRole("button",{name:t.returnRoom,exact:true}).click();
 await expect(page.getByRole("dialog")).toContainText(t.finaleTitle);
 await page.getByLabel(t.certificateName,{exact:true}).fill(name);
 await page.evaluate(async()=>{await document.fonts.ready;});
 let release!:()=>void;
 const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route("**/fonts/cormorant-garamond-latin-ext-500-normal.woff2",async route=>{await gate;await route.continue();});
 const fontRequested=page.waitForRequest(request=>request.url().endsWith("/fonts/cormorant-garamond-latin-ext-500-normal.woff2"));
 let downloaded=false;page.on("download",()=>{downloaded=true;});
 const pendingDownload=page.waitForEvent("download");
 const urls:string[]=[];page.on("request",request=>urls.push(request.url()));
 try {
  await page.getByRole("button",{name:t.certificateDownload,exact:true}).click();
  await fontRequested;
  await page.waitForTimeout(250);
  expect(downloaded).toBe(false);
  release();
  const download=await pendingDownload;
  const metadata=await sharp((await download.path())!).metadata();
  expect([metadata.width,metadata.height]).toEqual([1754,1240]);
  await mkdir("/tmp/museum-b4",{recursive:true});
  await download.saveAs(`/tmp/museum-b4/${info.project.name}-certificate-polish-name.png`);
  expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).not.toContain(name);
  expect(urls.some(url=>url.includes(name)||url.includes(encodeURIComponent(name)))).toBe(false);
 } finally {release();}
});
