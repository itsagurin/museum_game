import {expect,it} from "vitest";
import {wrapText} from "./share-card";
it("wraps titles at word boundaries",()=>expect(wrapText("one two three",s=>s.length,7)).toEqual(["one two","three"]));
it("truncates long titles within the permitted line width",()=>{const lines=wrapText("A very long title with many additional words",s=>s.length,10,2);expect(lines).toHaveLength(2);expect(lines[1]).toMatch(/…$/);expect(lines.every(line=>line.length<=10)).toBe(true);});
it("handles long words, whitespace and empty names",()=>{expect(wrapText("",s=>s.length,8)).toEqual([]);expect(wrapText("  Łódź   nad  rzeką ",s=>s.length,8)).toEqual(["Łódź nad","rzeką"]);expect(wrapText("abcdefghijklmnop",s=>s.length,4,2)).toEqual(["abcd","efg…"]);});
