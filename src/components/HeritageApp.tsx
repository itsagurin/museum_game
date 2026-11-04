"use client";

import { useShallow } from "zustand/react/shallow";
import { useCallback, useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import type { Panel } from "@/features/shell/panels";
import { copy } from "@/data/copy";
import { artworks, assetUrl, eras, getEra, isEraId } from "@/data/eras";
import { useGameStore } from "@/store/useGameStore";
import { usePaintingProgress } from "@/store/usePaintingProgress";
import { useSceneNavigation } from "@/hooks/useSceneNavigation";
import { getRoomProgress, MAX_ROOM_LEVEL } from "@/lib/room-development";
import type { Artwork, EraId, RestoreArtworkRequest, View } from "@/types/game";
import dynamic from "next/dynamic";
import { HouseScene } from "@/features/scenes/HouseScene";
import { HallScene } from "@/features/scenes/HallScene";
import { RoomScene } from "@/features/scenes/RoomScene";
import { GameScene } from "@/features/scenes/GameScene";
import { getSceneAssets } from "@/features/scenes/scene-assets";
import { AppHeader } from "@/features/shell/AppHeader";
import { ArtworkLibrary } from "./ArtworkLibrary";

import { StorageNotice, useStorageUnavailable } from "@/features/shell/StorageNotice";
import { useFullscreen } from "@/features/shell/useFullscreen";
import { useEraAccess } from "@/features/progression/useEraAccess";
import { useRewardsQueue } from "@/features/progression/useRewardsQueue";
import { useMilestones } from "@/features/progression/useMilestones";
import { useLockedRedirect } from "@/features/progression/useLockedRedirect";
import { useArtworkRestoration } from "@/features/progression/useArtworkRestoration";

const AppPanels = dynamic(() => import("@/features/shell/AppPanels").then(module => module.AppPanels));

const noRewards: string[] = [];
const devToolsEnabled = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "1";
let hydrationSettled = false;
const hydrationListeners = new Set<() => void>();
// A rejected/unreadable save must release the neutral screen too, keeping the healthy store.
if (typeof window !== "undefined") void Promise.allSettled([useGameStore.persist.rehydrate(), usePaintingProgress.persist.rehydrate()]).then(() => {
  hydrationSettled = true;
  hydrationListeners.forEach(notify => notify());
});
const subscribeHydration = (notify: () => void) => {
  hydrationListeners.add(notify);
  return () => { hydrationListeners.delete(notify); };
};
const readHydration = () => hydrationSettled;
const serverHydration = () => false;

/** Compose the house scenes, shell and progression without owning their presentation. */
export function HeritageApp({ onRestoreArtwork }: {
  onRestoreArtwork?: (request: RestoreArtworkRequest) => void;
}) {
  const { view, navigate } = useSceneNavigation();
  const { language, completedArtworkIds: completed, wallAssignments, setWallArtwork, highContrast, gentleMotion, exploreAll, resetProgress } = useGameStore(useShallow(state => ({language:state.language,completedArtworkIds:state.completedArtworkIds,wallAssignments:state.wallAssignments,setWallArtwork:state.setWallArtwork,highContrast:state.highContrast,gentleMotion:state.gentleMotion,exploreAll:state.exploreAll,resetProgress:state.resetProgress})));
  const savedPaintings = usePaintingProgress(state => state.paintings);
  const hydrated = useSyncExternalStore(subscribeHydration, readHydration, serverHydration);
  const readError = hydrated && (!useGameStore.persist.hasHydrated() || !usePaintingProgress.persist.hasHydrated());
  const [previewFinishedRoom, setPreviewFinishedRoom] = useState(false);
  const [libraryContext, setLibraryContext] = useState<{ eraId?: EraId; slotId?: string; returnView: Exclude<View, "library"> }>({ returnView: "home" });
  const roomPreview = devToolsEnabled && previewFinishedRoom;
  const reducedMotion = Boolean(useMotionPreference() || gentleMotion);
  const storageUnavailable = useStorageUnavailable();
  const { appRef, fullscreenAvailable, fullscreen, toggleFullscreen } = useFullscreen();
  const [panelsLoaded, setPanelsLoaded] = useState(false);
  const [animateScenes, setAnimateScenes] = useState(false);
  const { panel, setPanel: changePanel, closePanel, dismissPanel, addMilestones, resetMilestones } = useMilestones();
  const setPanel = useCallback((next: Panel) => { setPanelsLoaded(true); changePanel(next); }, [changePanel]);
  useEffect(() => {
    if (!hydrated) return;
    const animate = () => setAnimateScenes(true);
    for (const event of ["hashchange", "popstate", "heritage:navigate"]) window.addEventListener(event, animate);
    return () => { for (const event of ["hashchange", "popstate", "heritage:navigate"]) window.removeEventListener(event, animate); };
  }, [hydrated]);
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
    if (hydrated) useGameStore.getState().recordFirstPlay();
  }, [hydrated]);
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
      <div ref={appRef} className={`heritage-app view-${view === "home" ? "home" : "interior"} ${gentleMotion ? "gentle-motion" : ""}`}
        style={{ "--era-accent": activeEra?.accent || hallEra.accent } as CSSProperties}>
        <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); mainRef.current?.focus(); }}>{t.skip}</a>
        <div className="ambient-backdrop" style={view === "library" ? undefined : { backgroundImage: `url(${sceneImage})` }} aria-hidden="true" />
        <AppHeader view={view} activeEra={activeEra} hallEra={hallEra} language={language} returnView={libraryContext.returnView}
          navigate={navigate} openLibrary={openLibrary} fullscreenAvailable={fullscreenAvailable} fullscreen={fullscreen}
          toggleFullscreen={toggleFullscreen} openPanel={type => setPanel({type})} />
        <main id="main" ref={mainRef} tabIndex={-1}>
            <GameScene key={view} reducedMotion={reducedMotion} animate={animateScenes}>
              {view === "library" ? (
                <ArtworkLibrary key={`${libraryContext.eraId ?? "all"}-${libraryContext.slotId ?? "all"}`}
                  eraId={libraryContext.eraId} slotId={libraryContext.slotId} onRestore={restoreArtwork} isEraOpen={isEraOpen}
                  onHang={(slotId, artwork) => { setWallArtwork(slotId, artwork.id); navigate(artwork.eraId); }} />
              ) : view === "home" ? (
                <HouseScene language={language} houseImage={houseImage} completedCount={completed.length} navigate={navigate} openLibrary={openLibrary} isEraOpen={isEraOpen} onPaint={restoreArtwork} />
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
        </main>
        {(storageUnavailable || readError) && <StorageNotice key={storageUnavailable ? "write" : "read"} language={language} readError={!storageUnavailable && readError} />}
        {panelsLoaded && <AppPanels openInfo={()=>setPanel({type:"info"})} panel={panel} language={language} gentleMotion={gentleMotion} storageUnavailable={storageUnavailable}
          onReset={onReset} completed={completed} canRestore={Boolean(onRestoreArtwork)} restoreArtwork={restoreArtwork}
          dismissPanel={dismissPanel} closePanel={closePanel} eraAccess={eraAccess} view={view} goToEra={goToEra}
          houseImage={houseImage} resetMilestones={resetMilestones} openLibrary={openLibrary} navigate={navigate} />}
      </div>
  );
}
