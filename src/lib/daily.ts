import type { Artwork, EraId } from "@/types/game";
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
export function isDateKey(value: unknown): value is string {
  if(typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date=new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function getDailyArtwork(dateKey: string, collection: readonly Artwork[], completed: readonly string[], isEraOpen: (id: EraId)=>boolean): Artwork | undefined {
  const open=collection.filter(artwork=>isEraOpen(artwork.eraId));
  const remaining=open.filter(artwork=>!completed.includes(artwork.id));
  const candidates=(remaining.length ? remaining : open).toSorted((a,b)=>a.id<b.id ? -1 : a.id>b.id ? 1 : 0);
  let hash=0x811c9dc5;
  for(const char of dateKey) hash=Math.imul(hash ^ char.charCodeAt(0),0x01000193)>>>0;
  return candidates[hash % candidates.length];
}
export function getDailyStreak(history: readonly string[], today: string): number {
  if(!isDateKey(today)) return 0;
  const dates=new Set(history.filter(isDateKey));
  let cursor=new Date(`${today}T12:00:00Z`).getTime();
  const key=()=>new Date(cursor).toISOString().slice(0,10);
  if(!dates.has(key())) cursor-=86400000;
  let count=0;
  while(dates.has(key())) { count++; cursor-=86400000; }
  return count;
}
export function normalizeDailyHistory(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter(isDateKey))].sort().slice(-60) : [];
}
