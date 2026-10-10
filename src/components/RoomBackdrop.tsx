"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import assetManifest from "@/data/asset-manifest.json";
import { assetUrl } from "@/data/eras";
import { getRoomBackgroundCandidates } from "@/lib/room-development";
import { SceneImage } from "./SceneImage";

function BackgroundLayer({ src, alt, gentle }: { src: string; alt: string; gentle: boolean }) {
  const present = useIsPresent();
  return (
    <motion.div
      className="room-background-layer"
      aria-hidden={!present}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: gentle ? 0 : 0.65 }}
    >
      <SceneImage src={src} alt={alt} />
    </motion.div>
  );
}

export function RoomBackdrop({ baseImage, level, alt, gentle }: {
  baseImage: string;
  level: number;
  alt: string;
  gentle: boolean;
}) {
  const [readyImage, setReadyImage] = useState<string | null>(null);
  const candidates = getRoomBackgroundCandidates(baseImage, level, assetManifest);
  const candidateKey = JSON.stringify(candidates);

  useEffect(() => {
    const pendingFiles: string[] = JSON.parse(candidateKey);
    let cancelled = false;
    let image: HTMLImageElement | undefined;
    const loadNext = () => {
      const file = pendingFiles.shift();
      if (cancelled) return;
      if (!file) {
        setReadyImage(baseImage);
        return;
      }
      image = new Image();
      image.onload = () => {
        if (!cancelled) setReadyImage(file);
      };
      image.onerror = loadNext;
      image.src = assetUrl(file);
    };
    loadNext();
    return () => {
      cancelled = true;
      if (image) image.onload = image.onerror = null;
    };
  }, [candidateKey, baseImage]);

  // Keep the current backdrop and wall interactions while the next image loads.
  const src = assetUrl(readyImage ?? baseImage);
  return (
    <div className="room-backdrop" data-room-level={level}>
      <AnimatePresence initial={false}>
        <BackgroundLayer key={src} src={src} alt={alt} gentle={gentle} />
      </AnimatePresence>
    </div>
  );
}
