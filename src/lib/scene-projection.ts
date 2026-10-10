import type { ArtworkPlacement, VanishingPoint } from "@/types/game";
import { sceneSize } from "../data/scene";

/** Project a rectangle onto a wall while preserving the illustration's verticals. */
export function artworkProjection(placement: ArtworkPlacement, point: VanishingPoint) {
  const direction = placement.wall === "left" ? 1 : -1;
  const nearX = placement.x + (placement.wall === "right" ? placement.width : 0);
  const depth = placement.width / (direction * (point.x - nearX));
  const width = placement.width * sceneSize.width / 100;
  const horizon = (point.y - placement.y) * sceneSize.height / 100;
  const scaleX = 1 / (1 - depth);
  const perspectiveX = direction * depth * scaleX / width;
  const skewY = perspectiveX * horizon;

  return {
    transform: `matrix3d(${scaleX},${skewY},0,calc(${perspectiveX} / var(--scene-scale, 1)),0,1,0,0,0,0,1,0,0,0,0,1)`,
    transformOrigin: placement.wall === "left" ? "left top" : "right top",
  };
}
