"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { loadColoringArtwork } from "@/data/coloring-library";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import type { ColoringArtwork } from "@/lib/coloring";
import { usesIntroBoard } from "@/lib/intro-board";
import { paintingSaveEvent } from "@/lib/painting-session";
import { gridSignature } from "@/lib/painting-progress";
import { usePaintingProgress } from "@/store/usePaintingProgress";
import type { RestoreArtworkRequest } from "@/types/game";
import { usePaintingTelemetry } from "@/features/painting/usePaintingTelemetry";
import { ColoringCanvas } from "@/components/coloring-canvas";
import { ColoringAudio } from "@/components/coloring-audio";

export function ColoringStudio({ request, onComplete }: {
  request: RestoreArtworkRequest;
  onComplete: () => void;
}) {
  const language = useGameStore((state) => state.language);
  const gentleMotion = useGameStore((state) => state.gentleMotion);
  const autoFill = useGameStore((state) => state.autoFill);
  const highContrast = useGameStore(state => state.highContrast);
  const tutorialSeen = useGameStore(state => state.tutorialSeen);
  const completed = useGameStore(state => state.completedArtworkIds);
  const saved = usePaintingProgress.getState().paintings[request.artwork.id];
  const [useIntro] = useState(() => request.preloadedBoard?.intro ?? usesIntroBoard(request.artwork, completed.length, tutorialSeen, saved?.signature));
  const tutorialActive = !tutorialSeen && completed.length === 0;
  const [painting, setPainting] = useState<ColoringArtwork | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const t = copy[language];
  const artworkId = request.artwork.id;
  const board = useMemo(() => painting && {
    signature: gridSignature(painting),
    total: painting.grid.width * painting.grid.height,
  }, [painting]);
  const initialPainted = useMemo(() => {
    const saved = usePaintingProgress.getState().paintings[artworkId];
    return board && saved?.signature === board.signature && saved.total === board.total
      ? usePaintingProgress.getState().load(artworkId, board.signature, board.total) : [];
  }, [artworkId, board]);
  useEffect(() => {
    if (board) usePaintingProgress.getState().load(artworkId, board.signature, board.total);
  }, [artworkId, board]);
  const {paint:trackPainted,complete:trackComplete} = usePaintingTelemetry(request.artwork,board?.total ?? 0,initialPainted.length,completed.length===0);
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
    trackPainted(cellIds);
    pendingCells.current = cellIds;
    // Strokes arrive many times per second; one write per pause is enough.
    if (saveTimer.current === null) saveTimer.current = window.setTimeout(flush, 800);
  }, [flush,trackPainted]);
  useEffect(() => {
    window.addEventListener("pagehide", flush);
    window.addEventListener(paintingSaveEvent, flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener(paintingSaveEvent, flush);
      flush();
    };
  }, [flush]);

  useEffect(() => {
    const controller = new AbortController();
    const pending = attempt === 0 && request.preloadedBoard ? request.preloadedBoard.promise : loadColoringArtwork(useIntro ? {...request.artwork, coloringSource: request.artwork.introPuzzle} : request.artwork, controller.signal);
    void pending.then((payload) => {
      if (!controller.signal.aborted) setPainting(payload);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, [request.artwork, request.preloadedBoard, attempt, useIntro]);

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
          highContrast={highContrast}
          showBaseNumbers={useIntro}
          tutorialActive={tutorialActive}
          showColorNumbers
          allowDevColorFill={process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "1"}
          initialPainted={initialPainted}
          onPaintedChange={savePainted}
          onComplete={() => {
            // A finished board is recorded as completed; its cells are no longer needed.
            trackComplete();
            useGameStore.getState().markTutorialSeen();
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

