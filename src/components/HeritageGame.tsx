"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { loadColoringArtwork } from "@/data/coloring-library";
import { usesIntroBoard } from "@/lib/intro-board";
import { usePaintingProgress } from "@/store/usePaintingProgress";
import { StudioLoading, StudioLoadingContext } from "@/features/painting/StudioLoading";
import { flushPaintingSession } from "@/lib/painting-session";
import { useGameStore } from "@/store/useGameStore";
import type { RestoreArtworkRequest } from "@/types/game";
import { AnalyticsController } from "@/features/shell/AnalyticsController";
import { MusicController } from "@/features/shell/MusicController";
import { HeritageApp } from "./HeritageApp";

const ColoringOverlay = dynamic(() => import("@/features/painting/ColoringOverlay").then(module => module.ColoringOverlay), { loading: StudioLoading });

/** Connect the team's pixel painter to the house without using prototype progress. */
export function HeritageGame() {
  const [request, setRequest] = useState<RestoreArtworkRequest | null>(null);
  const [studioLoaded, setStudioLoaded] = useState(false);
  const session = useRef(0);
  const closeStudio = useCallback(() => {
    flushPaintingSession();
    useGameStore.getState().markTutorialSeen();
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
      request.preloadedBoard?.controller.abort();
    };
  }, [request, closeStudio]);

  const restore = (next: RestoreArtworkRequest) => {
    flushPaintingSession();
    const state = useGameStore.getState();
    const intro = usesIntroBoard(next.artwork, state.completedArtworkIds.length, state.tutorialSeen, usePaintingProgress.getState().paintings[next.artwork.id]?.signature);
    const controller = new AbortController();
    const promise = loadColoringArtwork(intro ? { ...next.artwork, coloringSource: next.artwork.introPuzzle } : next.artwork, controller.signal);
    void promise.catch(() => {}); // The studio presents the error once its code is ready.
    setStudioLoaded(true);
    setRequest({ ...next, sessionKey: ++session.current, preloadedBoard: { intro, promise, controller } });
  };
  return (
    <>
      <HeritageApp onRestoreArtwork={restore} />
      <MusicController studioEra={request?.artwork.eraId} />
      <AnalyticsController />
      <StudioLoadingContext.Provider value={request ? { title: request.artwork.title, close: closeStudio } : null}>
      {studioLoaded && <ColoringOverlay request={request} onClose={closeStudio} onComplete={() => {
        if (!request) return;
        setRequest(null);
        request.onComplete();
      }} />}
      </StudioLoadingContext.Provider>
    </>
  );
}
