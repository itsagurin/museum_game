import { describe,expect,it } from "vitest";
import { artworks } from "../data/eras";
import { getDailyArtwork,getDailyStreak,normalizeDailyHistory,isDateKey } from "./daily";
describe("daily painting",()=>{
 it("is deterministic and excludes locked eras and completed paintings",()=>{
  const open=(id:string)=>id==="era-1", completed=[artworks[0].id];
  const chosen=getDailyArtwork("2026-11-03",artworks,completed,open)!;
  expect(chosen).toEqual(getDailyArtwork("2026-11-03",[...artworks].reverse(),completed,open));
  expect(chosen.eraId).toBe("era-1");expect(completed).not.toContain(chosen.id);
 });
 it("offers a replay when the whole collection is complete",()=>expect(getDailyArtwork("2026-11-03",artworks,artworks.map(a=>a.id),()=>true)).toBeDefined());
 it("handles an empty available collection",()=>expect(getDailyArtwork("2026-11-03",artworks,[],()=>false)).toBeUndefined());
 it("counts a gentle streak across month and year boundaries",()=>{
  expect(getDailyStreak(["2026-12-30","2026-12-31","2027-01-01"],"2027-01-01")).toBe(3);
  expect(getDailyStreak(["2026-12-30","2026-12-31"],"2027-01-01")).toBe(2);
  expect(getDailyStreak(["2026-12-30"],"2027-01-01")).toBe(0);
 });
 it("validates actual calendar dates and caps history at sixty distinct days",()=>{
  expect(isDateKey("2026-02-30")).toBe(false);expect(isDateKey("2028-02-29")).toBe(true);
  expect(normalizeDailyHistory(["invalid","2026-11-03","2026-11-03"])).toEqual(["2026-11-03"]);
  const dates=Array.from({length:80},(_,i)=>new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10));
  expect(normalizeDailyHistory(dates)).toEqual(dates.slice(-60));
 });
});
