import { badgeDefinitions } from "./badges";
import { localDateKey } from "./daily";
export type AnalyticsEvent="app_open"|"tutorial_complete"|"painting_open"|"painting_complete"|"painting_abandon"|"era_unlock"|"era_complete"|"badge_earned"|"share"|"pwa_installed"|"offline_session";
const fields:Record<AnalyticsEvent,string[]>={app_open:["returning"],tutorial_complete:["seconds_bucket"],painting_open:["era","daily"],painting_complete:["era","cells_bucket","minutes_bucket","daily"],painting_abandon:["era","percent_bucket"],era_unlock:["era"],era_complete:["era"],badge_earned:["badge"],share:["kind","method"],pwa_installed:[],offline_session:[]};
const values:Record<string,readonly string[]>={era:["era-1","era-2","era-3","era-4"],returning:["first","d1","d2_6","d7_plus"],seconds_bucket:["under_60","60_179","180_299","300_plus"],minutes_bucket:["under_1","1_3","3_5","5_10","10_plus"],cells_bucket:["under_500","500_999","1000_plus"],percent_bucket:["0_24","25_49","50_74","75_99"],kind:["card","certificate"],method:["share","download"],badge:badgeDefinitions.map(b=>b.id)};
export function isAnalyticsEvent(event:unknown):event is AnalyticsEvent {return typeof event==="string" && Object.hasOwn(fields,event);}
export function safeAnalyticsProps(event:AnalyticsEvent,props:Record<string,unknown>):Record<string,string|boolean> {
 const result:Record<string,string|boolean>={};
 for(const key of fields[event] ?? []){const value=props[key];if(key==="daily" && typeof value==="boolean")result[key]=value;else if(typeof value==="string" && values[key]?.includes(value))result[key]=value;}
 return result;
}
export function returningBucket(first:number,now=Date.now()) {
 const days=Math.max(0,Math.round((Date.parse(`${localDateKey(new Date(now))}T12:00:00Z`)-Date.parse(`${localDateKey(new Date(first))}T12:00:00Z`))/86400000));
 return days===0 ? "first" : days===1 ? "d1" : days<7 ? "d2_6" : "d7_plus";
}
export const secondsBucket=(seconds:number)=>seconds<60 ? "under_60" : seconds<180 ? "60_179" : seconds<300 ? "180_299" : "300_plus";
export const minutesBucket=(minutes:number)=>minutes<1 ? "under_1" : minutes<3 ? "1_3" : minutes<5 ? "3_5" : minutes<10 ? "5_10" : "10_plus";
export const cellsBucket=(cells:number)=>cells<500 ? "under_500" : cells<1000 ? "500_999" : "1000_plus";
export const percentBucket=(percent:number)=>percent<25 ? "0_24" : percent<50 ? "25_49" : percent<75 ? "50_74" : "75_99";
export function analyticsAllowed(provider:string|undefined,site:string|undefined,enabled:boolean,mode:string|undefined,testOptIn=false) {return provider==="vercel" && Boolean(site) && enabled && (mode==="production" || testOptIn);}
