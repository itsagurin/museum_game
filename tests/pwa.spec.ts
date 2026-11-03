import { test, expect } from "@playwright/test";
import { seedGame } from "./helpers/game-state";

test.use({ serviceWorkers: "allow" });

test("installed shell and a visited painting work offline after reload",async({page,context})=>{
  await seedGame(page);
  await page.goto("/");
  await page.evaluate(async()=>{await navigator.serviceWorker.ready; if(!navigator.serviceWorker.controller) await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener("controllerchange",()=>resolve(),{once:true}));});
  await page.goto("/#era-1");
  await page.locator(".painting-frame").first().click();
  await page.locator(".paint-brush").first().click();
  await page.locator(".pixel-hit.matching").first().press("Enter");
  await page.keyboard.press("Escape");
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".room-canvas")).toBeVisible();
  await page.locator(".painting-frame").first().click();
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(1);
  await page.locator(".paint-brush").first().click();
  await page.locator(".pixel-hit.matching:not(.painted)").first().press("Enter");
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await page.goto("/#hall");await expect(page.locator(".hall-canvas")).toBeVisible();
  await page.goto("/#home");await expect(page.locator(".home-canvas")).toBeVisible();
  const manifest=await page.evaluate(async()=>(async()=>{const response=await fetch("/manifest.webmanifest");return response.json();})());
  expect(manifest.display).toBe("standalone");
});

test("a waiting update lets painting continue until refresh is requested",async({page})=>{
  await seedGame(page);
  await page.addInitScript(()=>{
    const worker={postMessage:(message:unknown)=>{(window as unknown as {updateMessage:unknown}).updateMessage=message;}};
    const registration={waiting:worker,addEventListener:()=>{}};
    Object.defineProperty(navigator,"serviceWorker",{value:{controller:{},register:()=>Promise.resolve(registration),addEventListener:()=>{},removeEventListener:()=>{}}});
  });
  await page.goto("/#era-1");
  await expect(page.locator(".pwa-update")).toBeVisible();
  await page.locator(".painting-frame").first().click();
  await page.locator(".paint-brush").first().click();
  await page.locator(".pixel-hit.matching").first().press("Enter");
  await expect(page.locator(".pixel-hit.painted")).toHaveCount(1);
  expect(await page.evaluate(()=>(window as unknown as {updateMessage?:unknown}).updateMessage)).toBeUndefined();
  await page.getByRole("button",{name:"Odśwież",exact:true}).click();
  expect(await page.evaluate(()=>(window as unknown as {updateMessage?:unknown}).updateMessage)).toEqual({type:"SKIP_WAITING"});
});
