import { describe,expect,it } from "vitest";
import { content } from "../data/eras";
import { badgeDefinitions,getBadges,type BadgeDefinition } from "./badges";
describe("collection badges",()=>{
 it("validates unique IDs and exact artists against the manifest",()=>{
  expect(new Set(badgeDefinitions.map(b=>b.id)).size).toBe(badgeDefinitions.length);
  const expected=[...new Set(content.map(entry=>entry.artist))].filter(artist=>content.filter(entry=>entry.artist===artist).length>=3).sort();
  expect(badgeDefinitions.flatMap(b=>b.rule.type==="artist" ? [b.rule.artist] : []).sort()).toEqual(expected);
  for(const badge of badgeDefinitions){expect(badge.title.pl).toBeTruthy();expect(badge.title.en).toBeTruthy();expect(badge.description.pl).toBeTruthy();expect(badge.description.en).toBeTruthy();}
 });
 it("counts known completions once and awards count thresholds",()=>{
  const first=content[0].id,result=getBadges(content,[first,first,"unknown"]);
  expect(result.find(b=>b.id==="count-1")?.earned).toBe(true);
  expect(result.find(b=>b.id==="count-10")?.progress).toBe(1);
 });
 it("counts an artist across eras and supports numeric and all rules",()=>{
  const artist=content.find(entry=>entry.artist.includes("Matejko"))!.artist,works=content.filter(entry=>entry.artist===artist);
  expect(new Set(works.map(entry=>entry.era)).size).toBeGreaterThan(1);
  const defs:BadgeDefinition[]=[{id:"artist",title:{pl:"PL",en:"EN"},description:{pl:"PL",en:"EN"},rule:{type:"artist",artist,count:2}}];
  expect(getBadges(content,works.slice(0,2).map(e=>e.id),defs)[0].earned).toBe(true);
  expect(getBadges(content,works.slice(0,-1).map(e=>e.id)).find(b=>b.rule.type==="artist" && b.rule.artist===artist)?.earned).toBe(false);
 });
 it("awards every badge after all artworks, including each era and the finale",()=>expect(getBadges(content,content.map(e=>e.id)).every(b=>b.earned)).toBe(true));
});
