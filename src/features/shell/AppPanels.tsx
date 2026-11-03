"use client";

import { AnimatePresence } from "framer-motion";
import { ArrowRight, Paintbrush } from "lucide-react";
import { copy } from "@/data/copy";
import { artworks, assetUrl, getEra } from "@/data/eras";
import { Dialog } from "@/components/Dialog";
import { ArtworkStory } from "@/components/ArtworkStory";
import { EraLockedNotice, MilestoneNotice } from "@/components/ProgressNotices";
import type { Artwork, EraId, Language, View } from "@/types/game";
import type { getEraAccess } from "@/lib/room-development";
import type { Panel } from "./panels";
import { SettingsPanel } from "./SettingsPanel";
import { InfoPanel } from "./InfoPanel";

export function AppPanels({ panel, language, gentleMotion, storageUnavailable, onReset, completed, canRestore, restoreArtwork, dismissPanel, closePanel, eraAccess, view, goToEra, houseImage, resetMilestones, openLibrary, navigate }: {
  panel: Panel | null; language: Language; gentleMotion: boolean; storageUnavailable: boolean; onReset: () => void;
  completed: string[]; canRestore: boolean; restoreArtwork: (artwork: Artwork) => void;
  dismissPanel: () => void; closePanel: () => void; eraAccess: ReturnType<typeof getEraAccess>; view: View;
  goToEra: (eraId: EraId) => void; houseImage: string; resetMilestones: () => void;
  openLibrary: () => void; navigate: (view: View) => void;
}) {
  const t = copy[language];
  return (
        <AnimatePresence>
          {panel && (
            <Dialog
              title={
                panel.type === "settings"
                  ? t.settings
                  : panel.type === "info"
                    ? t.info
                    : panel.type === "story"
                      ? t.fact
                      : panel.type === "locked"
                        ? t.lockedTitle
                        : panel.type === "milestone"
                          ? panel.milestone.type === "badge" ? t.badgeTitle : panel.milestone.type === "unlock" ? t.unlockTitle : panel.milestone.type === "eraComplete" ? t.eraCompleteTitle : t.finaleTitle
                          : t.studioTitle
              }
              closeLabel={t.close}
              onClose={dismissPanel}
              gentle={gentleMotion}
              variant={panel.type === "story" ? "story" : "default"}
            >
              {panel.type === "settings" ? (
                <SettingsPanel language={language} storageUnavailable={storageUnavailable} onReset={onReset} />
              ) : panel.type === "info" ? (
                <InfoPanel language={language} onExplore={() => { closePanel(); navigate("hall"); }} />
              ) : panel.type === "story" ? (
                <ArtworkStory
                  key={panel.artwork.id}
                  artwork={panel.artwork}
                  language={language}
                  completed={completed.includes(panel.artwork.id)}
                  onRestore={canRestore ? () => restoreArtwork(panel.artwork) : undefined}
                  onClose={dismissPanel}
                />
              ) : panel.type === "locked" ? (
                <EraLockedNotice
                  eraName={getEra(panel.eraId).name[language]}
                  requiredEra={eraAccess[panel.eraId].requiredEraId}
                  remaining={eraAccess[panel.eraId].remaining}
                  language={language}
                  onGo={(eraId) => (eraId === view ? closePanel() : goToEra(eraId))}
                />
              ) : panel.type === "milestone" ? (
                <MilestoneNotice
                  milestone={panel.milestone}
                  language={language}
                  houseImage={houseImage}
                  collectionSize={artworks.length}
                  onNavigate={(next) => {
                    resetMilestones();
                    if (next === "library") openLibrary();
                    else if (next === view) closePanel();
                    else navigate(next);
                  }}
                  onClose={dismissPanel}
                />
              ) : panel.type === "studio" ? (
                <>
                  <div className="studio-preview">
                    <span className="studio-paper">
                      <img src={assetUrl("blank_paper_crossmark.jpg")} alt="" />
                    </span>
                    <span className="studio-badge glass">
                      <Paintbrush size={17} />
                    </span>
                  </div>
                  <span className="studio-caption">
                    {panel.artwork.title[language]} ·{" "}
                    {getEra(panel.artwork.eraId).name[language]}
                  </span>
                  <p className="dialog-intro">{t.studioBody}</p>
                  <button
                    className="primary-button full-width"
                    onClick={closePanel}
                  >
                    {t.returnRoom}
                    <ArrowRight size={18} />
                  </button>
                </>
              ) : null}
            </Dialog>
          )}
        </AnimatePresence>
  );
}
