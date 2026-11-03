import {test,expect} from "@playwright/test";
import {seedGame} from "./helpers/game-state";
test("music starts off, follows the era after enabling and pauses when hidden",async({page})=>{
 await seedGame(page);await page.goto("/#era-2");
 const players=page.locator("audio[data-music]");await expect(players).toHaveCount(2);
 expect(await players.evaluateAll(elements=>elements.every(element=>(element as HTMLAudioElement).paused && !element.getAttribute("src")))).toBe(true);
 await page.getByRole("button",{name:"Ustawienia",exact:true}).click();
 await page.getByRole("switch",{name:"Muzyka",exact:true}).click();
 await expect.poll(()=>players.evaluateAll(elements=>elements.some(element=>(element as HTMLAudioElement).src.endsWith("/audio/music/era-2.mp3")))).toBe(true);
 await page.evaluate(()=>{Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"));});
 expect(await players.evaluateAll(elements=>elements.every(element=>(element as HTMLAudioElement).paused))).toBe(true);
});
