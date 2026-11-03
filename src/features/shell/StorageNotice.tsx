"use client";
import { useEffect, useState } from "react";
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

export function StorageNotice({ language }: { language: Language }) {
  return <div className="storage-notice glass" role="status">{copy[language].savedError}</div>;
}
