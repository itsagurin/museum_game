"use client";
import {useCallback,useEffect,useRef} from "react";
import {useGameStore} from "@/store/useGameStore";
import {track} from "@/lib/analytics";
import {cellsBucket,minutesBucket,percentBucket,secondsBucket} from "@/lib/analytics-rules";
import {localDateKey} from "@/lib/daily";
import type {Artwork} from "@/types/game";
export function usePaintingTelemetry(artwork:Artwork,total:number,initialCount:number,firstPainting:boolean) {
 const started=useRef(0),finished=useRef(false),cells=useRef(initialCount),size=useRef(total),first=useRef(firstPainting);
 const context=useRef({era:artwork.eraId,daily:false});
 useEffect(()=>{size.current=total;cells.current=initialCount;},[total,initialCount]);
 useEffect(()=>{
  started.current=performance.now();
  const choice=useGameStore.getState().dailySelection;
  const meta={era:artwork.eraId,daily:choice?.dateKey===localDateKey(new Date()) && choice.artworkId===artwork.id};
  context.current=meta;
  void track("painting_open",meta);
  return()=>{if(!finished.current && (!size.current || cells.current<size.current))void track("painting_abandon",{era:meta.era,percent_bucket:percentBucket(size.current ? cells.current*100/size.current : 0)});};
 },[artwork.id,artwork.eraId]);
 const paint=useCallback((ids:number[])=>{cells.current=ids.length;},[]);
 const complete=useCallback(()=>{
  finished.current=true;
  void track("painting_complete",{...context.current,cells_bucket:cellsBucket(size.current),minutes_bucket:minutesBucket((performance.now()-started.current)/60000)});
  if(first.current)void track("tutorial_complete",{seconds_bucket:secondsBucket((Date.now()-(useGameStore.getState().firstPlayedAt ?? Date.now()))/1000)});
 },[]);
 return {paint,complete};
}
