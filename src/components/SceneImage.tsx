"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { copy } from "@/data/copy";

export function SceneImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const language = useGameStore((state) => state.language);
  if (failed)
    return (
      <div
        className={`image-fallback ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff size={28} />
        <span>{copy[language].imageError}</span>
      </div>
    );
  return (
    <img
      className={`scene-image ${className}`}
      src={src}
      alt={alt}
      width="896"
      height="1200"
      onError={() => setFailed(true)}
      fetchPriority="high"
      draggable={false}
    />
  );
}
