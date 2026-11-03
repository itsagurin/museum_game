import { assetUrl, eras } from "@/data/eras";
import { halls } from "@/data/halls";
import assetManifest from "@/data/asset-manifest.json";

export function getSceneAssets(completedRooms: number) {
  const hallStage = Math.min(completedRooms + 1, eras.length);
  const hallEra = eras[hallStage - 1];
  const hallLayout = halls[hallStage - 1];
  const houseImage = assetUrl(`house${completedRooms}.jpg`);
  const hallImageName =
    assetManifest.find((file) =>
      new RegExp(`^${hallLayout.image}\\.(jpg|jpeg|png|webp)$`, "i").test(file),
    ) ||
    assetManifest.find((file) => /^hall\.(jpg|jpeg|png|webp)$/i.test(file));
  return { hallStage, hallEra, hallLayout, houseImage, hallImageName };
}
