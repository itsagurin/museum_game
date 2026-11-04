"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { copy } from "@/data/copy";
import type { Language } from "@/types/game";

export function useStorageUnavailable() {
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const handler = () => setUnavailable(true);
    window.addEventListener("heritage:storage-unavailable", handler);
    return () => window.removeEventListener("heritage:storage-unavailable", handler);
  }, []);
  return unavailable;
}

export function StorageNotice({ language, readError = false }: { language: Language; readError?: boolean }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return <div className="storage-notice glass" role="status"><span>{readError ? copy[language].saveReadError : copy[language].savedError}</span>
    <button className="icon-button storage-notice-close" aria-label={copy[language].dismissSaveNotice} onClick={() => setClosed(true)}><X size={16} aria-hidden /></button>
  </div>;
}
