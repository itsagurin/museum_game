import {test,expect,type Page} from "@playwright/test";
import {seedGame} from "./helpers/game-state";
const providerScript=`(()=>{let before=e=>e;const handle=(type,payload)=>{if(type==='beforeSend'){before=payload;return;}if(type==='event'){const safe=before({type:'event',url:location.href});if(safe)void fetch('/_vercel/insights/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...safe,...payload})});}};const pending=window.vaq||[];window.va=handle;for(const args of pending)handle(...Array.from(args));})();`;
async function provider(page:Page,enabled=true) {
 const events:Record<string,unknown>[]=[];let scripts=0;
 if(enabled)await page.addInitScript(()=>{(window as unknown as {__HERITAGE_ANALYTICS_TEST__:boolean}).__HERITAGE_ANALYTICS_TEST__=true;});
 await page.route("**/_vercel/insights/script.js",route=>{scripts++;return route.fulfill({contentType:"text/javascript",body:providerScript});});
 await page.route("**/_vercel/insights/event",route=>{events.push(route.request().postDataJSON());return route.fulfill({json:{ok:true}});});
 return {events,scripts:()=>scripts};
}
test("unconfigured analytics never loads the provider",async({page})=>{
 const observed=await provider(page,false);await seedGame(page);await page.goto("/");await expect(page.locator(".daily-card")).toBeVisible();await page.waitForTimeout(400);expect(observed.scripts()).toBe(0);expect(observed.events).toEqual([]);
});
test("enabled analytics sends only safe game events and strips query/hash",async({page})=>{
 const observed=await provider(page);await seedGame(page);await page.goto("/?marker=private_marker#era-1");await page.locator(".painting-frame").first().click();await expect(page.locator(".coloring-canvas")).toBeVisible();
 await expect.poll(()=>observed.events.some(event=>event.name==="painting_open")).toBe(true);
 const open=observed.events.find(event=>event.name==="painting_open")!;expect(open.data).toEqual({era:"era-1",daily:false});expect(JSON.stringify(observed.events)).not.toContain("private_marker");expect(JSON.stringify(observed.events)).not.toContain("#era-1");
});
test("opting out blocks initial requests and later events",async({page})=>{
 const observed=await provider(page);await seedGame(page,{analyticsEnabled:false});await page.goto("/#era-1");await expect(page.locator(".room-canvas")).toBeVisible();await page.waitForTimeout(400);expect(observed.scripts()).toBe(0);
 await page.getByRole("button",{name:"Ustawienia",exact:true}).click();const toggle=page.getByRole("switch",{name:"Wysyłaj anonimowe statystyki",exact:true});await toggle.focus();await page.keyboard.press("Space");await expect(toggle).toBeFocused();await expect.poll(()=>observed.events.length).toBeGreaterThan(0);
 await page.getByRole("switch",{name:"Wysyłaj anonimowe statystyki",exact:true}).click();const count=observed.events.length;await page.keyboard.press("Escape");await page.locator(".painting-frame").first().click();await expect(page.locator(".coloring-canvas")).toBeVisible();await page.waitForTimeout(300);expect(observed.events).toHaveLength(count);
});
