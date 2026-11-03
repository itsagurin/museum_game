import {expect,it} from "vitest";
import {analyticsAllowed,safeAnalyticsProps,returningBucket,secondsBucket,minutesBucket,cellsBucket,percentBucket} from "./analytics-rules";
import {track} from "./analytics";
it("is a no-op without a browser, provider configuration, consent or explicit development opt-in",async()=>{
 expect(await track("app_open",{returning:"first"})).toBe(false);
 expect(analyticsAllowed(undefined,undefined,true,"production")).toBe(false);
 expect(analyticsAllowed("vercel","site",false,"production")).toBe(false);
 expect(analyticsAllowed("vercel","site",true,"development")).toBe(false);
 expect(analyticsAllowed("vercel","site",true,"test",true)).toBe(true);
});
it("drops identifiers, free text, raw timings and invalid enum values",()=>{
 expect(safeAnalyticsProps("painting_complete",{era:"era-1",daily:true,cells_bucket:"under_500",minutes_bucket:"3_5",name:"Private",url:"https://example.test/private",seconds:7})).toEqual({era:"era-1",daily:true,cells_bucket:"under_500",minutes_bucket:"3_5"});
 expect(safeAnalyticsProps("painting_open",{era:"private text",daily:"yes"})).toEqual({});
 expect(safeAnalyticsProps("share",{kind:"certificate",method:"download",name:"Private"})).toEqual({kind:"certificate",method:"download"});
});
it("uses coarse buckets at the first-reward and abandon boundaries",()=>{
 expect([59,60,179,180,299,300].map(secondsBucket)).toEqual(["under_60","60_179","60_179","180_299","180_299","300_plus"]);
 expect(minutesBucket(5)).toBe("5_10");expect(cellsBucket(1000)).toBe("1000_plus");expect(percentBucket(25)).toBe("25_49");
});
it("classifies return days across a month boundary without a player identifier",()=>{
 const first=Date.UTC(2026,10,30,12);
 expect([0,1,2,6,7,30].map(days=>returningBucket(first,first+days*86400000))).toEqual(["first","d1","d2_6","d2_6","d7_plus","d7_plus"]);
});
