"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { copy } from "@/data/copy";
import { artworks, assetUrl, eras, getEra, isEraId } from "@/data/eras";
import { useGameStore } from "@/store/useGameStore";
import { usePaintingProgress } from "@/store/usePaintingProgress";
import { useSceneNavigation } from "@/hooks/useSceneNavigation";
import { getRoomProgress, MAX_ROOM_LEVEL } from "@/lib/room-development";
import type { Artwork, EraId, RestoreArtworkRequest, View } from "@/types/game";
import { ArtworkLibrary } from "./ArtworkLibrary";
import { HouseScene } from "@/features/scenes/HouseScene";
import { HallScene } from "@/features/scenes/HallScene";
import { RoomScene } from "@/features/scenes/RoomScene";
import { GameScene } from "@/features/scenes/GameScene";
import { getSceneAssets } from "@/features/scenes/scene-assets";
import { AppHeader } from "@/features/shell/AppHeader";
import { AppPanels } from "@/features/shell/AppPanels";
import { StorageNotice, useStorageUnavailable } from "@/features/shell/StorageNotice";
import { useFullscreen } from "@/features/shell/useFullscreen";
import { useEraAccess } from "@/features/progression/useEraAccess";
import { useRewardsQueue } from "@/features/progression/useRewardsQueue";
import { useMilestones } from "@/features/progression/useMilestones";
import { useLockedRedirect } from "@/features/progression/useLockedRedirect";
import { useArtworkRestoration } from "@/features/progression/useArtworkRestoration";

const noRewards: string[] = [];
const devToolsEnabled = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "1";

/** Compose the house scenes, shell and progression without owning their presentation. */
export function HeritageApp({ onRestoreArtwork }: {
  onRestoreArtwork?: (request: RestoreArtworkRequest) => void;
}) {
  const { view, navigate } = useSceneNavigation();
  const { language, completedArtworkIds: completed, wallAssignments, setWallArtwork, highContrast, gentleMotion, exploreAll, resetProgress } = useGameStore();
  const savedPaintings = usePaintingProgress(state => state.paintings);
  const [hydrated, setHydrated] = useState(false);
  const [previewFinishedRoom, setPreviewFinishedRoom] = useState(false);
  const [libraryContext, setLibraryContext] = useState<{ eraId?: EraId; slotId?: string; returnView: Exclude<View, "library"> }>({ returnView: "home" });
  const roomPreview = devToolsEnabled && previewFinishedRoom;
  const reducedMotion = Boolean(useReducedMotion() || gentleMotion);
  const storageUnavailable = useStorageUnavailable();
  const { appRef, fullscreenAvailable, fullscreen, toggleFullscreen } = useFullscreen();
  const { panel, setPanel, closePanel, dismissPanel, addMilestones, resetMilestones } = useMilestones();
  const { pendingRewards, consumeRewards, addRewards, resetRewards } = useRewardsQueue();
  const { eraAccess, isEraOpen } = useEraAccess(completed, exploreAll);
  const activeEra = isEraId(view) ? getEra(view) : null;
  const roomProgress = activeEra ? getRoomProgress(activeEra.id, artworks, completed) : null;
  const roomLevel = roomPreview ? MAX_ROOM_LEVEL : roomProgress?.level ?? 0;
  const completedRooms = eras.filter(era => getRoomProgress(era.id, artworks, completed).isComplete).length;
  const { hallEra, houseImage, hallImageName } = getSceneAssets(completedRooms);
  const sceneImage = activeEra ? assetUrl(activeEra.image) : view === "hall" && hallImageName ? assetUrl(hallImageName) : houseImage;
  const blockedEraId = hydrated && activeEra && !isEraOpen(activeEra.id) ? activeEra.id : null;
  const mainRef = useLockedRedirect({ view, blockedEraId, navigate, closePanel, setPanel });
  const restoreArtwork = useArtworkRestoration({ language, exploreAll, closePanel, setPanel, isEraOpen, onRestoreArtwork, addRewards, addMilestones });
  const t = copy[language];

  useEffect(() => {
    void Promise.all([useGameStore.persist.rehydrate(), usePaintingProgress.persist.rehydrate()]).then(() => setHydrated(true));
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => { document.documentElement.classList.toggle("high-contrast", highContrast); }, [highContrast]);

  const goToEra = (eraId: EraId) => {
    if (isEraOpen(eraId)) navigate(eraId);
    else setPanel({ type: "locked", eraId });
  };
  const openLibrary = (eraId?: EraId, slotId?: string) => {
    setLibraryContext({ eraId, slotId, returnView: activeEra?.id ?? (view === "hall" ? "hall" : "home") });
    navigate("library");
  };
  const openArtwork = (artwork: Artwork, slotId: string) => {
    if (roomPreview || completed.includes(artwork.id)) openLibrary(artwork.eraId, slotId);
    else restoreArtwork(artwork);
  };
  const onReset = () => {
    resetProgress();
    usePaintingProgress.getState().reset();
    setPreviewFinishedRoom(false);
    resetRewards();
    resetMilestones();
    closePanel();
  };

  if (!hydrated) return (
    <div className="heritage-app hydration-screen" aria-busy="true">
      <div className="ambient-backdrop" aria-hidden="true" />
      <noscript><HouseScene language="pl" houseImage={assetUrl("house0.jpg")} completedCount={0} navigate={() => {}} openLibrary={() => {}} /></noscript>
    </div>
  );

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <div ref={appRef} className={`heritage-app view-${view === "home" ? "home" : "interior"} ${gentleMotion ? "gentle-motion" : ""}`}
        style={{ "--era-accent": activeEra?.accent || hallEra.accent } as CSSProperties}>
        <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); mainRef.current?.focus(); }}>{t.skip}</a>
        <div className="ambient-backdrop" style={{ backgroundImage: `url(${sceneImage})` }} aria-hidden="true" />
        <AppHeader view={view} activeEra={activeEra} hallEra={hallEra} language={language} returnView={libraryContext.returnView}
          navigate={navigate} openLibrary={openLibrary} fullscreenAvailable={fullscreenAvailable} fullscreen={fullscreen}
          toggleFullscreen={toggleFullscreen} openPanel={type => setPanel({type})} />
        <main id="main" ref={mainRef} tabIndex={-1}>
          <AnimatePresence mode="wait" initial={false}>
            <GameScene key={view} reducedMotion={reducedMotion}>
              {view === "library" ? (
                <ArtworkLibrary key={`${libraryContext.eraId ?? "all"}-${libraryContext.slotId ?? "all"}`}
                  eraId={libraryContext.eraId} slotId={libraryContext.slotId} onRestore={restoreArtwork} isEraOpen={isEraOpen}
                  onHang={(slotId, artwork) => { setWallArtwork(slotId, artwork.id); navigate(artwork.eraId); }} />
              ) : view === "home" ? (
                <HouseScene language={language} houseImage={houseImage} completedCount={completed.length} navigate={navigate} openLibrary={openLibrary} />
              ) : view === "hall" ? (
                <HallScene language={language} completedRooms={completedRooms} navigate={navigate} openLibrary={openLibrary} isEraOpen={isEraOpen} goToEra={goToEra} />
              ) : activeEra && roomProgress ? (
                <RoomScene activeEra={activeEra} language={language} roomLevel={roomLevel} roomProgress={roomProgress}
                  roomPreview={roomPreview} reducedMotion={reducedMotion} panelOpen={Boolean(panel)}
                  pendingRewards={pendingRewards[activeEra.id] ?? noRewards} consumeRewards={consumeRewards}
                  wallAssignments={wallAssignments} completed={completed} savedPaintings={savedPaintings}
                  navigate={navigate} goToEra={goToEra} isEraOpen={isEraOpen} openArtwork={openArtwork}
                  openStory={artwork => setPanel({type:"story",artwork})} openLibrary={openLibrary}
                  togglePreview={() => setPreviewFinishedRoom(current => !current)} />
              ) : null}
            </GameScene>
          </AnimatePresence>
        </main>
        {storageUnavailable && <StorageNotice language={language} />}
        <AppPanels panel={panel} language={language} gentleMotion={gentleMotion} storageUnavailable={storageUnavailable}
          onReset={onReset} completed={completed} canRestore={Boolean(onRestoreArtwork)} restoreArtwork={restoreArtwork}
          dismissPanel={dismissPanel} closePanel={closePanel} eraAccess={eraAccess} view={view} goToEra={goToEra}
          houseImage={houseImage} resetMilestones={resetMilestones} openLibrary={openLibrary} navigate={navigate} />
      </div>
    </MotionConfig>
  );
}
