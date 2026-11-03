"use client";

import { copy } from "@/data/copy";
import type { Language } from "@/types/game";
import { BookOpen, Check } from "lucide-react";
import { assetUrl } from "@/data/eras";
import type { Artwork, ArtworkSlot, Era } from "@/types/game";
import type { SavedPainting } from "@/store/usePaintingProgress";
import { getRoomArtworkPlacement } from "@/data/room-decorations";
import { artworkProjection } from "@/lib/scene-projection";
import { RestoredArtwork } from "@/components/RestoredArtwork";
import { regionStyle } from "./geometry";
const noteUrl = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/note.svg`;

export function WallArtwork({ artwork, slot, activeEra, roomLevel, roomPreview, completed, savedPaintings, language, openArtwork, openStory }: {
  artwork: Artwork; slot: ArtworkSlot; activeEra: Era; roomLevel: number; roomPreview: boolean;
  completed: string[]; savedPaintings: Record<string, SavedPainting>; language: Language;
  openArtwork: (artwork: Artwork, slotId: string) => void; openStory: (artwork: Artwork) => void;
}) {
  const t = copy[language];
                          const placement = getRoomArtworkPlacement(activeEra.id, slot.number, roomLevel);
                          const restored = roomPreview || completed.includes(artwork.id);
                          const started = restored ? undefined : savedPaintings[artwork.id];
                          const startedPercent = started ? Math.max(1, Math.floor(started.painted * 100 / started.total)) : 0;
                          return (
                          <div
                            key={slot.id}
                            data-slot-id={slot.id}
                            className={`wall-artwork wall-${placement.wall} ${roomLevel > 0 ? "furnished-artwork" : ""}`}
                            style={{
                              ...regionStyle(placement),
                              ...artworkProjection(placement, activeEra.wallPerspective[placement.wall]),
                            }}
                          >
                            <button
                              className="painting-frame"
                              onClick={() => openArtwork(artwork, slot.id)}
                              aria-label={`${artwork.title[language]} — ${restored ? t.restoredLabel : started ? `${t.inProgress} ${startedPercent}%` : t.awaiting}`}
                            >
                              <span className="paper-crop">
                                {restored && artwork.originalImage ? (
                                  <RestoredArtwork key={artwork.id} artwork={artwork} />
                                ) : (
                                  <img src={assetUrl("blank_paper_crossmark.jpg")} alt="" draggable={false} className="unrestored-paper" />
                                )}
                              </span>
                              {restored &&
                                artwork.originalImage && (
                                  <span className="completed-mark">
                                    <Check size={11} />
                                  </span>
                                )}
                              {started && (
                                <span className="paper-progress" aria-hidden="true">
                                  {startedPercent}%
                                </span>
                              )}
                            </button>
                            <button
                              className="painting-note"
                              style={{ backgroundImage: `url(${noteUrl})` }}
                              onClick={() =>
                                openStory(artwork)
                              }
                              aria-label={`${t.story} — ${artwork.title[language]}`}
                            >
                              <BookOpen size={12} />
                              <span>
                                {String(slot.number).padStart(2, "0")}
                              </span>
                            </button>
                          </div>
  );
}
