"use client";

import { copy } from "@/data/copy";
import type { Language, EraId, View } from "@/types/game";
import { GameViewport } from "@/components/GameViewport";
import { SceneImage } from "@/components/SceneImage";
import { hallDoorStyle } from "./geometry";
import { LockKeyhole } from "lucide-react";
import { assetUrl, eras } from "@/data/eras";
import { fallbackHallDoors } from "@/data/halls";
import { HallBackdrop } from "@/components/HallBackdrop";
import { EraSwitcher } from "../shell/EraSwitcher";
import { getSceneAssets } from "./scene-assets";

export function HallScene({ language, completedRooms, navigate, openLibrary, isEraOpen, goToEra }: {
  language: Language; completedRooms: number; navigate: (view: View) => void;
  openLibrary: () => void; isEraOpen: (id: EraId) => boolean; goToEra: (id: EraId) => void;
}) {
  const t = copy[language];
  const { hallStage, hallImageName, hallLayout } = getSceneAssets(completedRooms);
  return (<>
    <GameViewport lockCamera className="hall-canvas" focalY={0.52} label={t.hall}>
      {hallImageName ? <SceneImage key={hallImageName} src={assetUrl(hallImageName)} alt={t.hall} /> : <HallBackdrop stage={hallStage} />}
      <div className="scene-light" aria-hidden="true" />
      {
                  eras.map((era, index) => (
                    <button
                      key={era.id}
                      className={`hall-door-hit ${isEraOpen(era.id) ? "" : "locked"}`}
                      data-era={era.id}
                      data-depth={index === 1 || index === 2 ? "far" : "near"}
                      style={hallDoorStyle(
                        hallImageName
                          ? hallLayout.doors[era.id]
                          : fallbackHallDoors[era.id],
                      )}
                      onClick={() => goToEra(era.id)}
                      aria-label={isEraOpen(era.id) ? era.name[language] : `${era.name[language]} — ${t.locked}`}
                    >
                      <span className="era-door-number glass">
                        {isEraOpen(era.id) ? era.numeral : <LockKeyhole size={13} aria-hidden="true" />}
                      </span>
                    </button>
                  ))
      }
    </GameViewport>
    <EraSwitcher view="hall" language={language} navigate={navigate} openLibrary={openLibrary} isEraOpen={isEraOpen} goToEra={goToEra} />
  </>);
}
