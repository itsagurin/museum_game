import type { CSSProperties } from "react";
import type { Region } from "@/types/game";
export const regionStyle = (region: Region): CSSProperties => ({
  left: `${region.x}%`,
  top: `${region.y}%`,
  width: `${region.width}%`,
  height: `${region.height}%`,
});
export const hallDoorStyle = (region: Region): CSSProperties => ({
  ...regionStyle(region),
  left: `${region.x + region.width / 2}%`,
  transform: "translateX(-50%)",
});
