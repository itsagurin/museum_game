"use client";

import { copy } from "@/data/copy";
import type { Language, EraId, View } from "@/types/game";
import { DoorOpen, Images } from "lucide-react";
import { eras } from "@/data/eras";

export function EraSwitcher({ view, language, activeEraId, navigate, openLibrary, isEraOpen, goToEra }: {
  view: View; language: Language; activeEraId?: EraId; navigate: (view: View) => void;
  openLibrary: (eraId?: EraId) => void; isEraOpen: (eraId: EraId) => boolean; goToEra: (eraId: EraId) => void;
}) {
  const t = copy[language];
  return (
                  <nav className="era-switcher glass" aria-label={t.rooms}>
                    {activeEraId && <button className="room-library-toggle icon-button" aria-label={t.changePaintings} onClick={() => openLibrary(activeEraId)}><Images size={19} /></button>}
                    <button
                      className="icon-button"
                      aria-label={t.toHall}
                      onClick={() => navigate("hall")}
                      aria-current={view === "hall" ? "page" : undefined}
                    >
                      <DoorOpen size={19} />
                    </button>
                    <span className="switcher-divider" />
                    {eras.map((era) => (
                      <button
                        key={era.id}
                        className={`era-switch ${view === era.id ? "selected" : ""} ${isEraOpen(era.id) ? "" : "locked"}`}
                        aria-label={isEraOpen(era.id) ? era.name[language] : `${era.name[language]} — ${t.locked}`}
                        aria-current={view === era.id ? "page" : undefined}
                        onClick={() => goToEra(era.id)}
                      >
                        {era.numeral}
                      </button>
                    ))}
                  </nav>
  );
}
