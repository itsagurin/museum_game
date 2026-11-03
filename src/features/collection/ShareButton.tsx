"use client";
import { useState } from "react";
import { copy } from "@/data/copy";
import { deliverPng,renderShareCard } from "@/lib/share-card";
import type { Artwork,Language } from "@/types/game";
export function ShareButton({artwork,language}:{artwork:Artwork;language:Language}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(false),t=copy[language];
  return <div className="share-action"><button className="secondary-button share-button" disabled={busy} onClick={async()=>{setBusy(true);setError(false);try{await deliverPng(await renderShareCard(artwork,language),`${artwork.id}.png`);}catch{setError(true);}finally{setBusy(false);}}}>{busy ? t.preparingFile : t.share}</button>{error && <p role="status">{t.fileError}</p>}</div>;
}
