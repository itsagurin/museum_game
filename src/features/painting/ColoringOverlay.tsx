"use client";
import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { Dialog } from "@/components/Dialog";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import type { RestoreArtworkRequest } from "@/types/game";
import { ColoringStudio } from "./ColoringStudio";

export function ColoringOverlay({ request, onClose, onComplete }: {
  request: RestoreArtworkRequest | null; onClose: () => void; onComplete: () => void;
}) {
  const language = useGameStore(state => state.language);
  const gentle = useGameStore(state => state.gentleMotion);
  return <LazyMotion features={domAnimation} strict><AnimatePresence>
    {request && <Dialog title={request.artwork.title[language]} closeLabel={copy[language].returnRoom} onClose={onClose} gentle={gentle} variant="coloring">
      <ColoringStudio key={request.sessionKey ?? request.artwork.id} request={request} onComplete={onComplete} />
    </Dialog>}
  </AnimatePresence></LazyMotion>;
}
