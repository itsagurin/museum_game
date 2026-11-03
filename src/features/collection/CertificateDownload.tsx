"use client";
import { useId,useState } from "react";
import { copy } from "@/data/copy";
import { deliverPng,renderCertificate } from "@/lib/share-card";
import type { Language } from "@/types/game";
export function CertificateDownload({count,language}:{count:number;language:Language}) {
  const id=useId(),[name,setName]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(false),t=copy[language];
  return <div className="certificate-download"><label htmlFor={id}>{t.certificateName}</label><input id={id} value={name} maxLength={80} autoComplete="off" onChange={event=>setName(event.target.value)} /><button className="secondary-button full-width" disabled={busy} onClick={async()=>{setBusy(true);setError(false);try{await deliverPng(await renderCertificate(count,language,name),"dziedzictwo-certificate.png");}catch{setError(true);}finally{setBusy(false);}}}>{busy ? t.preparingFile : t.certificateDownload}</button>{error && <p role="status">{t.fileError}</p>}</div>;
}
