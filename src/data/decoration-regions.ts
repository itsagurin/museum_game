import geometryData from "./decoration-geometry.json" with { type: "json" };
import { sceneSize } from "./scene";
import { roomDecorations, type RoomDecoration } from "./room-decorations";
import type { Region } from "../types/game";

export interface DecorationGeometry {
  width: number; height: number; intrinsicWidth: number; intrinsicHeight: number;
  bounds: Region;
  hitPath: string;
}

const geometries: Record<string, DecorationGeometry> = geometryData;
export function getDecorationGeometry(decoration: RoomDecoration) { return geometries[decoration.image]; }
export function getDecorationBounds(decoration: RoomDecoration): Region {
  const { bounds } = getDecorationGeometry(decoration);
  const height = decoration.width * sceneSize.width / sceneSize.height * bounds.height / bounds.width;
  if (decoration.contact && decoration.supportId) {
    const support = getDecorationBounds(roomDecorations.find(({ id }) => id === decoration.supportId)!);
    return {
      x: support.x + support.width * decoration.x / 100 - decoration.width * decoration.contact.x,
      y: support.y + support.height * decoration.y / 100 - height * decoration.contact.y,
      width: decoration.width, height,
    };
  }
  return { x: decoration.x, y: decoration.y, width: decoration.width, height };
}
export function getDecorationImageRegion(decoration: RoomDecoration): Region {
  const { width, height, bounds } = getDecorationGeometry(decoration);
  const solid = getDecorationBounds(decoration);
  return { x: solid.x - bounds.x / bounds.width * solid.width,
    y: solid.y - bounds.y / bounds.height * solid.height,
    width: solid.width * width / bounds.width, height: solid.height * height / bounds.height };
}
