"use client";
import { useEffect, useRef, useState } from "react";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function ServiceWorker() {
  const language = useGameStore(state => state.language);
  const [waiting, setWaiting] = useState<ServiceWorkerRegistration | null>(null);
  const applyUpdate = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let disposed=false;
    const onController = () => { if(applyUpdate.current) window.location.reload(); };
    navigator.serviceWorker.addEventListener("controllerchange", onController);
    void navigator.serviceWorker.register(`${base}/sw.js`, {scope:`${base}/`}).then(registration => {
      const check = () => { if(!disposed && registration.waiting && navigator.serviceWorker.controller) setWaiting(registration); };
      check();
      registration.addEventListener("updatefound", () => registration.installing?.addEventListener("statechange", check));
    }).catch(() => { /* The online game remains usable when service workers are unavailable. */ });
    return () => { disposed=true; navigator.serviceWorker.removeEventListener("controllerchange",onController); };
  }, []);
  if(!waiting) return null;
  return <div className="pwa-update glass" role="status"><span>{copy[language].updateAvailable}</span><button className="secondary-button" onClick={() => { applyUpdate.current=true; waiting.waiting?.postMessage({type:"SKIP_WAITING"}); }}>{copy[language].refresh}</button></div>;
}
