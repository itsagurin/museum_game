"use client";

import { copy } from "@/data/copy";
import type { Language, View } from "@/types/game";
import { GameViewport } from "@/components/GameViewport";
import { SceneImage } from "@/components/SceneImage";
import { regionStyle } from "./geometry";
import { ArrowRight, ArrowUpRight, DoorOpen, Images, Paintbrush } from "lucide-react";
import { artworks } from "@/data/eras";

export function HouseScene({ language, houseImage, completedCount, navigate, openLibrary }: {
  language: Language; houseImage: string; completedCount: number;
  navigate: (view: View) => void; openLibrary: () => void;
}) {
  const t = copy[language];
  return (<>
    <GameViewport lockCamera className="home-canvas" focalY={0.52} label={t.home}>
      <SceneImage key={houseImage} src={houseImage} alt={t.home} />
      <div className="scene-light" aria-hidden="true" />
                  <button
                    className="house-door-hit"
                    style={regionStyle({ x: 47, y: 52, width: 8, height: 7 })}
                    onClick={() => navigate("hall")}
                    aria-label={t.enter}
                  >
                    <span className="door-beacon">
                      <DoorOpen size={17} />
                    </span>
                  </button>
    </GameViewport>
                  <div className="home-copy">
                    <span className="eyebrow">{t.eyebrow}</span>
                    <h1>
                      {t.heroFirst}
                      <br />
                      <em>{t.heroSecond}</em>
                    </h1>
                  </div>
                  <span className="journey-pill glass">
                    <Paintbrush size={14} />
                    {completedCount} / {artworks.length}
                    <span>{t.restored}</span>
                  </span>
                  <div className="home-actions">
                    <button
                      className="primary-button"
                      onClick={() => navigate("hall")}
                    >
                      {t.enter}
                      <ArrowUpRight size={21} />
                    </button>
                    <button className="home-library-button glass" onClick={() => openLibrary()}><Images size={18} />{t.library}<ArrowRight size={16} /></button>
                  </div>
  </>);
}
