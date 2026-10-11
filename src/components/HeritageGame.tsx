"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { loadColoringArtwork } from "@/data/coloring-library";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import type { ColoringArtwork } from "@/lib/coloring";
import type { RestoreArtworkRequest } from "@/types/game";
import { HeritageApp } from "./HeritageApp";
import { ColoringCanvas } from "./coloring-canvas";
import { Dialog } from "./Dialog";

function ColoringStudio({ request, onComplete }: {
  request: RestoreArtworkRequest;
  onComplete: () => void;
}) {
  const language = useGameStore((state) => state.language);
  const gentleMotion = useGameStore((state) => state.gentleMotion);
  const autoFill = useGameStore((state) => state.autoFill);
  const [painting, setPainting] = useState<ColoringArtwork | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const t = copy[language];

  useEffect(() => {
    const controller = new AbortController();
    void loadColoringArtwork(request.artwork, controller.signal).then((payload) => {
      if (!controller.signal.aborted) setPainting(payload);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, [request.artwork, attempt]);

  return (
    <>
      <div className="coloring-heading">
        <span className="eyebrow">{request.era.name[language]}</span>
        {request.artwork.artist && <p className="artwork-credit">{request.artwork.artist}{request.artwork.year && ` · ${request.artwork.year}`}</p>}
      </div>
      {painting ? (
        <ColoringCanvas
          key={painting.id}
          artwork={{ ...painting, title: request.artwork.title[language] }}
          language={language}
          gentleMotion={gentleMotion}
          autoFill={autoFill}
          showColorNumbers
          allowDevColorFill={process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "1"}
          onComplete={onComplete}
        />
      ) : (
        <div className="coloring-loading" role="status" aria-busy={!error}>
          <Sparkles size={25} strokeWidth={1} aria-hidden="true" />
          <p>{error ? t.coloringLoadError : t.coloringLoading}</p>
          {error && <button className="secondary-button" onClick={() => { setError(false); setAttempt((value) => value + 1); }}>{t.coloringRetry}</button>}
        </div>
      )}
    </>
  );
}

/** Connect the team's pixel painter to the house without using prototype progress. */
export function HeritageGame() {
  const [request, setRequest] = useState<RestoreArtworkRequest | null>(null);
  const language = useGameStore((state) => state.language);
  const gentleMotion = useGameStore((state) => state.gentleMotion);
  const t = copy[language];
  const closeStudio = useCallback(() => {
    request?.onClose();
    setRequest(null);
  }, [request]);

  useEffect(() => {
    if (!request) return;
    window.addEventListener("hashchange", closeStudio);
    window.addEventListener("popstate", closeStudio);
    return () => {
      window.removeEventListener("hashchange", closeStudio);
      window.removeEventListener("popstate", closeStudio);
    };
  }, [request, closeStudio]);

  return (
    <>
      <HeritageApp onRestoreArtwork={setRequest} />
      <AnimatePresence>
        {request && (
          <Dialog title={request.artwork.title[language]} closeLabel={t.returnRoom} onClose={closeStudio} gentle={gentleMotion} variant="coloring">
            <ColoringStudio
              key={request.artwork.id}
              request={request}
              onComplete={() => {
                setRequest(null);
                request.onComplete();
              }}
            />
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
