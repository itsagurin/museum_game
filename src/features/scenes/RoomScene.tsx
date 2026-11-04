"use client";

import { copy } from "@/data/copy";
import type { Language, EraId, View } from "@/types/game";
import { GameViewport } from "@/components/GameViewport";
import { RoomBackdrop } from "@/components/RoomBackdrop";
import dynamic from "next/dynamic";
const RoomDecorations = dynamic(() => import("@/components/RoomDecorations").then(module => module.RoomDecorations));
import { ChevronLeft, ChevronRight, LockKeyhole, Paintbrush, Sparkles } from "lucide-react";
import { eras, getWallArtworks } from "@/data/eras";
import { getRoomProgress, MAX_ROOM_LEVEL } from "@/lib/room-development";
import type { Artwork, Era } from "@/types/game";
import type { WallAssignments } from "@/lib/wall-gallery";
import type { SavedPainting } from "@/store/usePaintingProgress";
import { EraSwitcher } from "../shell/EraSwitcher";
import { WallArtwork } from "./WallArtwork";
import { regionStyle } from "./geometry";
const devToolsEnabled = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "1";
const noRewards: string[] = [];

export function RoomScene({ activeEra, language, roomLevel, roomProgress, roomPreview, reducedMotion, panelOpen, pendingRewards, consumeRewards, wallAssignments, completed, savedPaintings, navigate, goToEra, isEraOpen, openArtwork, openStory, openLibrary, togglePreview }: {
  activeEra: Era; language: Language; roomLevel: number; roomProgress: ReturnType<typeof getRoomProgress>;
  roomPreview: boolean; reducedMotion: boolean; panelOpen: boolean; pendingRewards: string[];
  consumeRewards: (ids: string[]) => void; wallAssignments: WallAssignments; completed: string[];
  savedPaintings: Record<string, SavedPainting>; navigate: (view: View) => void;
  goToEra: (id: EraId) => void; isEraOpen: (id: EraId) => boolean;
  openArtwork: (artwork: Artwork, slotId: string) => void; openStory: (artwork: Artwork) => void;
  openLibrary: (eraId?: EraId) => void; togglePreview: () => void;
}) {
  const t = copy[language];
  const eraIndex = eras.findIndex(era => era.id === activeEra.id);
  return (<>
    <GameViewport key={roomPreview ? "preview" : "game"} fixedOverview={roomPreview} className="room-canvas" focalY={0.43} label={activeEra.name[language]}>
      <RoomBackdrop key={activeEra.id} baseImage={activeEra.image} level={roomLevel} alt={activeEra.name[language]} />
      <div className="scene-light" aria-hidden="true" />
      {roomLevel > 0 && <RoomDecorations eraId={activeEra.id} level={roomLevel} language={language} gentle={reducedMotion} active={!panelOpen} pendingIds={roomPreview ? noRewards : pendingRewards} onRewardsShown={consumeRewards} />}
      {getWallArtworks(activeEra.id, wallAssignments).map(({artwork,slot}) => <WallArtwork key={slot.id} artwork={artwork} slot={slot} activeEra={activeEra} roomLevel={roomLevel} roomPreview={roomPreview} completed={completed} savedPaintings={savedPaintings} language={language} openArtwork={openArtwork} openStory={openStory} />)}
                      <button
                        className="room-door-hit"
                        style={regionStyle(activeEra.doors.previous)}
                        onClick={() =>
                          navigate(
                            eraIndex === 0 ? "hall" : eras[eraIndex - 1].id,
                          )
                        }
                        aria-label={
                          eraIndex === 0
                            ? t.toHall
                            : `${t.previous}: ${eras[eraIndex - 1].name[language]}`
                        }
                      >
                        <span className="door-route glass">
                          <ChevronLeft size={15} />
                          {eraIndex === 0 ? t.hall : eras[eraIndex - 1].numeral}
                        </span>
                      </button>
                      <button
                        className="room-door-hit"
                        style={regionStyle(activeEra.doors.next)}
                        onClick={() =>
                          eraIndex === eras.length - 1 ? navigate("hall") : goToEra(eras[eraIndex + 1].id)
                        }
                        aria-label={
                          eraIndex === eras.length - 1
                            ? t.toHall
                            : `${t.next}: ${eras[eraIndex + 1].name[language]}${isEraOpen(eras[eraIndex + 1].id) ? "" : ` — ${t.locked}`}`
                        }
                      >
                        <span className="door-route glass">
                          {eraIndex === eras.length - 1
                            ? t.hall
                            : eras[eraIndex + 1].numeral}
                          {eraIndex < eras.length - 1 && !isEraOpen(eras[eraIndex + 1].id) ? <LockKeyhole size={13} aria-hidden="true" /> : <ChevronRight size={15} />}
                        </span>
                      </button>
    </GameViewport>
                    <div className="room-status-group">
                      <div className="room-status glass">
                        <Paintbrush size={15} />
                        <span>
                          {roomProgress.completedCount} / {roomProgress.totalCount}
                        </span>
                        <span className="status-label">{t.restored}</span>
                        <span className="room-level-divider" aria-hidden="true" />
                        <span className="room-level-label">{t.roomLevel} {roomProgress.level} / {MAX_ROOM_LEVEL}</span>
                        <span
                          className="room-level-meter"
                          role="progressbar"
                          aria-label={t.roomDevelopment}
                          aria-valuemin={0}
                          aria-valuemax={MAX_ROOM_LEVEL}
                          aria-valuenow={roomProgress.level}
                          aria-valuetext={`${t.roomLevel} ${roomProgress.level} / ${MAX_ROOM_LEVEL}`}
                        >
                          {Array.from({ length: MAX_ROOM_LEVEL }, (_, index) => <i key={index} className={index < roomProgress.level ? "filled" : ""} />)}
                        </span>
                      </div>
                      {devToolsEnabled && <button
                        className={`room-dev-preview glass ${roomPreview ? "active" : ""}`}
                        aria-label={t.devRoomPreview}
                        aria-pressed={roomPreview}
                        title={t.devRoomPreviewDescription}
                        onClick={() => togglePreview()}
                      >
                        <Sparkles size={14} aria-hidden="true" />
                        {roomPreview ? t.devRoomPreviewOff : t.devRoomPreview}
                      </button>}
                    </div>
    <EraSwitcher view={activeEra.id} activeEraId={activeEra.id} language={language} navigate={navigate} openLibrary={openLibrary} isEraOpen={isEraOpen} goToEra={goToEra} />
  </>);
}
