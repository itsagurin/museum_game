"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { loadColoringArtwork } from "@/data/coloring-library";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import type { ColoringArtwork } from "@/lib/coloring";
import { gridSignature } from "@/lib/painting-progress";
import { usePaintingProgress } from "@/store/usePaintingProgress";
import type { RestoreArtworkRequest } from "@/types/game";
import { HeritageApp } from "./HeritageApp";
import { ColoringCanvas } from "./coloring-canvas";
import { ColoringAudio } from "./coloring-audio";
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
  const artworkId = request.artwork.id;
  const board = useMemo(() => painting && {
    signature: gridSignature(painting),
    total: painting.grid.width * painting.grid.height,
  }, [painting]);
  const initialPainted = useMemo(() => board ? usePaintingProgress.getState().load(artworkId, board.signature, board.total) : [], [artworkId, board]);
  const pendingCells = useRef<number[] | null>(null);
  const saveTimer = useRef<number | null>(null);
  const finished = useRef(false);
  const flush = useCallback(() => {
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = null;
    if (!board || finished.current || !pendingCells.current) return;
    usePaintingProgress.getState().save(artworkId, board.signature, board.total, pendingCells.current);
    pendingCells.current = null;
  }, [artworkId, board]);
  const savePainted = useCallback((cellIds: number[]) => {
    pendingCells.current = cellIds;
    // Strokes arrive many times per second; one write per pause is enough.
    if (saveTimer.current === null) saveTimer.current = window.setTimeout(flush, 800);
  }, [flush]);
  useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

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
      <ColoringAudio />
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
          initialPainted={initialPainted}
          onPaintedChange={savePainted}
          onComplete={() => {
            // A finished board is recorded as completed; its cells are no longer needed.
            finished.current = true;
            pendingCells.current = null;
            usePaintingProgress.getState().clear(artworkId);
            onComplete();
          }}
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
