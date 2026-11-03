"use client";
import { useEffect,useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useSceneNavigation } from "@/hooks/useSceneNavigation";
import { createMusicPlayer,musicTrackForView } from "@/lib/music";
import type { EraId,View } from "@/types/game";
export function MusicController({studioEra}:{studioEra?:EraId}) {
  const {view}=useSceneNavigation();
  const first=useRef<HTMLAudioElement>(null),second=useRef<HTMLAudioElement>(null);
  const player=useRef<ReturnType<typeof createMusicPlayer>|null>(null);
  const scene=useRef<{view:View;studio:boolean}>({view:"home",studio:false});
  const sync=useRef<()=>void>(()=>{});
  useEffect(()=>{
    const audios=[first.current!,second.current!] as [HTMLAudioElement,HTMLAudioElement];
    const mixer=createMusicPlayer(audios);player.current=mixer;
    const update=()=>{const state=useGameStore.getState(),track=musicTrackForView(scene.current.view);mixer.update({src:`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/audio/${track.file}`,enabled:state.musicEnabled,volume:state.musicVolume,studio:scene.current.studio,hidden:document.hidden});};
    sync.current=update;update();
    const gesture=(event:Event)=>{if(event.isTrusted)mixer.unlock();};
    const unsubscribe=useGameStore.subscribe(update);
    document.addEventListener("pointerdown",gesture,true);document.addEventListener("keydown",gesture,true);document.addEventListener("visibilitychange",update);
    return()=>{unsubscribe();mixer.dispose();player.current=null;document.removeEventListener("pointerdown",gesture,true);document.removeEventListener("keydown",gesture,true);document.removeEventListener("visibilitychange",update);audios.forEach(audio=>{audio.removeAttribute("src");audio.load();});};
  },[]);
  useEffect(()=>{scene.current={view:studioEra ?? view,studio:Boolean(studioEra)};sync.current();},[view,studioEra]);
  return <><audio ref={first} data-music="first" preload="none" hidden/><audio ref={second} data-music="second" preload="none" hidden/></>;
}
