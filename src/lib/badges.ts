import definitions from "../../content/badges.json";
import type { EraId, Localized } from "@/types/game";
import type { ContentEntry } from "@/types/content";
export type BadgeRule = {type:"era";era:EraId} | {type:"artist";artist:string;count:number|"all"} | {type:"count";count:number} | {type:"all"};
export interface BadgeDefinition {id:string;title:Localized;description:Localized;rule:BadgeRule}
export const badgeDefinitions=definitions as BadgeDefinition[];
export function getBadges(content: readonly Pick<ContentEntry,"id"|"era"|"artist">[], completed: readonly string[], badges: readonly BadgeDefinition[]=badgeDefinitions) {
  const done=new Set(completed);
  return badges.map(badge=>{
    const scope=content.filter(entry=>badge.rule.type === "era" ? entry.era===badge.rule.era : badge.rule.type === "artist" ? entry.artist===badge.rule.artist : true);
    const total=badge.rule.type === "count" ? badge.rule.count : badge.rule.type === "artist" && typeof badge.rule.count === "number" ? badge.rule.count : scope.length;
    const progress=Math.min(total,scope.filter(entry=>done.has(entry.id)).length);
    return {...badge,total,progress,earned:total>0 && progress===total};
  });
}
