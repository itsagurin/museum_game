"use client";
import { useEffect, useState } from "react";
import { artworks, getEra } from "@/data/eras";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import { getDailyArtwork, getDailyStreak, localDateKey } from "@/lib/daily";
import type { Artwork, EraId, Language } from "@/types/game";
export function DailyCard({language,isEraOpen,onPaint}: {language:Language;isEraOpen:(id:EraId)=>boolean;onPaint:(artwork:Artwork)=>void}) {
  const {completedArtworkIds:completed,dailyHistory,dailySelection,selectDailyArtwork}=useGameStore();
  const [dateKey,setDateKey]=useState(()=>localDateKey(new Date()));
  useEffect(()=>{
    const update=()=>setDateKey(localDateKey(new Date()));
    const timer=window.setInterval(update,30000);
    window.addEventListener("focus",update);document.addEventListener("visibilitychange",update);
    return()=>{window.clearInterval(timer);window.removeEventListener("focus",update);document.removeEventListener("visibilitychange",update);};
  },[]);
  const saved=dailySelection?.dateKey===dateKey ? artworks.find(artwork=>artwork.id===dailySelection.artworkId && isEraOpen(artwork.eraId)) : undefined;
  const artwork=saved ?? getDailyArtwork(dateKey,artworks,completed,isEraOpen);
  useEffect(()=>{if(artwork && (!saved || dailySelection?.dateKey!==dateKey)) selectDailyArtwork(dateKey,artwork.id);},[artwork,saved,dateKey,dailySelection,selectDailyArtwork]);
  if(!artwork) return null;
  const t=copy[language],done=dailyHistory.includes(dateKey),streak=getDailyStreak(dailyHistory,dateKey);
  return <aside className="daily-card glass" aria-label={t.dailyTitle} data-artwork-id={artwork.id}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={artwork.thumbnailImage} alt="" loading="lazy" />
    <div><span className="eyebrow">{done ? t.dailyDone : t.dailyTitle}{!done && completed.includes(artwork.id) ? ` · ${t.dailyReplay}` : ""}</span>
      <h2>{artwork.title[language]}</h2><p>{done ? artwork.funFact?.[language] : getEra(artwork.eraId).name[language]}</p>
      <div className="daily-actions"><button className="secondary-button" onClick={()=>onPaint(artwork)}>{t.dailyPaint}</button>{streak>0 && <span>{t.dailyStreak(streak)}</span>}</div>
    </div>
  </aside>;
}
