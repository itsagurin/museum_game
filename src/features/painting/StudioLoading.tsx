"use client";
import { createContext, useContext, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import type { Localized } from "@/types/game";

export const StudioLoadingContext = createContext<{ title: Localized; close: () => void } | null>(null);

/** Keep focus, cancellation and fullscreen working while the painter's code downloads. */
export function StudioLoading() {
  const pending = useContext(StudioLoadingContext);
  const language = useGameStore(state => state.language);
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = pending?.close;
  useEffect(() => {
    if (!close) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const button = ref.current?.querySelector("button");
    button?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "Tab") { event.preventDefault(); button?.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, [close]);
  if (!pending) return null;
  const t = copy[language];
  return createPortal(<div className="dialog-backdrop coloring-backdrop" onClick={pending.close}>
    <div ref={ref} className="dialog-panel glass heritage-coloring" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={event => event.stopPropagation()}>
      <div className="dialog-top"><h2 id={titleId}>{pending.title[language]}</h2><button className="icon-button" aria-label={t.returnRoom} onClick={pending.close}>×</button></div>
      <div className="coloring-loading" role="status" aria-busy="true"><p>{t.coloringLoading}</p></div>
    </div>
  </div>, document.fullscreenElement ?? document.body);
}
