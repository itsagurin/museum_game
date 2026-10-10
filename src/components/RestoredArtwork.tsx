"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { findColoringArtwork } from "@/data/coloring-library";
import type { Artwork } from "@/types/game";

export function RestoredArtwork({ artwork }: { artwork: Artwork }) {
  const [failed, setFailed] = useState(false);
  const painting = findColoringArtwork(artwork.coloringArtworkId);

  // Preserve the painted result when an external reproduction is unavailable.
  if (failed && painting) {
    const colors = new Map(painting.palette.map((color) => [color.id, color.hex]));
    return (
      <svg
        className="original-artwork pixel-preview"
        viewBox={`0 0 ${painting.grid.width} ${painting.grid.height}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {painting.grid.data.flatMap((row, y) => row.map((id, x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={colors.get(id)} shapeRendering="crispEdges" />
        )))}
      </svg>
    );
  }

  if (failed || !artwork.originalImage) {
    return <span className="original-artwork library-image-fallback" aria-hidden="true"><ImageOff size={20} /></span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={artwork.originalImage} alt="" draggable={false} className="original-artwork" onError={() => setFailed(true)} />
  );
}
