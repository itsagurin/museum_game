"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { findColoringArtwork, originalImageFor } from "@/data/coloring-library";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import type { RestoreArtworkRequest } from "@/types/game";
import { HeritageApp } from "./HeritageApp";
import { ColoringCanvas } from "./coloring-canvas";
import { Dialog } from "./Dialog";

/** Connect the team's pixel painter to the house without using prototype progress. */
export function HeritageGame() {
  const [request, setRequest] = useState<RestoreArtworkRequest | null>(null);
  const language = useGameStore((state) => state.language);
  const gentleMotion = useGameStore((state) => state.gentleMotion);
  const t = copy[language];
  const painting = findColoringArtwork(request?.artwork.coloringArtworkId);
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
        {request && painting && (
          <Dialog title={request.artwork.title[language]} closeLabel={t.returnRoom} onClose={closeStudio} gentle={gentleMotion} variant="coloring">
            <div className="coloring-heading">
              <span className="eyebrow">{request.era.name[language]}</span>
              <p>{painting.artist} · {painting.year}</p>
            </div>
            <ColoringCanvas
              key={painting.id}
              artwork={{ ...painting, original_image_url: originalImageFor(painting) }}
              language={language}
              gentleMotion={gentleMotion}
              showColorNumbers
              allowDevColorFill={process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "1"}
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
