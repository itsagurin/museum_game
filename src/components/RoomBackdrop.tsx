"use client";

import { assetUrl } from "@/data/eras";
import { SceneImage } from "./SceneImage";

export function RoomBackdrop({ baseImage, level, alt }: {
  baseImage: string;
  level: number;
  alt: string;
}) {
  // Furniture is layered separately. Keep the original empty illustration.
  return (
    <div className="room-backdrop" data-room-level={level}>
      <SceneImage src={assetUrl(baseImage)} alt={alt} />
    </div>
  );
}
