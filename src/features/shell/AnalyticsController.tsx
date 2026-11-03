"use client";
import { useEffect,useRef,useSyncExternalStore } from "react";
import { useGameStore } from "@/store/useGameStore";
import { track } from "@/lib/analytics";
import { returningBucket } from "@/lib/analytics-rules";
import { localDateKey } from "@/lib/daily";
const subscribe=(notify:()=>void)=>useGameStore.persist.onFinishHydration(notify);
export function AnalyticsController() {
 const ready=useSyncExternalStore(subscribe,()=>useGameStore.persist.hasHydrated(),()=>false);
 const pending=useRef<string|null>(null);
 const active=useGameStore(state=>state.analyticsEnabled);
 useEffect(()=>{
  if(!ready || !active)return;
  let offline=!navigator.onLine,disposed=false;
  const open=()=>{
   const state=useGameStore.getState(),today=localDateKey(new Date());
   if(state.lastAnalyticsDay!==today && pending.current!==today){pending.current=today;void track("app_open",{returning:returningBucket(state.firstPlayedAt ?? Date.now())}).then(sent=>{if(sent && !disposed)useGameStore.getState().markAnalyticsDay(today);}).finally(()=>{pending.current=null;});}
  };
  const online=()=>{if(offline){void track("offline_session");offline=false;}open();};
  const disconnected=()=>{offline=true;};const installed=()=>{void track("pwa_installed");};
  open();window.addEventListener("online",online);window.addEventListener("offline",disconnected);window.addEventListener("focus",open);window.addEventListener("appinstalled",installed);
  return()=>{disposed=true;window.removeEventListener("online",online);window.removeEventListener("offline",disconnected);window.removeEventListener("focus",open);window.removeEventListener("appinstalled",installed);};
 },[ready,active]);
 return null;
}
