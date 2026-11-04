"use client";
import { useEffect, useState } from "react";
import type { Artwork } from "@/types/game";

export function useArtworkDetails<T extends Artwork | undefined>(artwork: T, enabled = true): { artwork: T; loading: boolean; error: boolean } {
  const [details, setDetails] = useState<Partial<Artwork>>();
  const [failed, setFailed] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const id = artwork?.id;
  useEffect(() => {
    const retry = () => setAttempt(value => value + 1);
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);
  useEffect(() => {
    if (!id || !enabled) return;
    let disposed = false;
    void import("@/data/artwork-details").then(module => {
      if (!disposed) setDetails({ id, ...module.getArtworkText(id) });
    }).catch(() => { if (!disposed) setFailed(id); });
    return () => { disposed = true; };
  }, [id, enabled, attempt]);
  const ready = Boolean(id && details?.id === id);
  const error = Boolean(id && enabled && !ready && failed === id);
  return { artwork: (ready ? { ...artwork, ...details } : artwork) as T, loading: Boolean(id && enabled && !ready && !error), error };
}
