"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
  useIsPresent,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  House,
  Info,
  LockKeyhole,
  Maximize,
  Minimize,
  Paintbrush,
  Images,
  Settings2,
  Sparkles,
} from "lucide-react";
import { copy } from "@/data/copy";
import { artworks, assetUrl, eras, getEra, getWallArtworks, isEraId } from "@/data/eras";
import { fallbackHallDoors, halls } from "@/data/halls";
import assetManifest from "@/data/asset-manifest.json";
import { useGameStore } from "@/store/useGameStore";
import { useSceneNavigation } from "@/hooks/useSceneNavigation";
import type { Artwork, EraId, Region, RestoreArtworkRequest, View } from "@/types/game";
import { Dialog } from "./Dialog";
import { HallBackdrop } from "./HallBackdrop";
import { SceneImage } from "./SceneImage";
import { GameViewport } from "./GameViewport";
import { artworkProjection } from "@/lib/scene-projection";
import { RestoredArtwork } from "./RestoredArtwork";
import { RoomBackdrop } from "./RoomBackdrop";
import { getEraAccess, getRoomProgress, MAX_ROOM_LEVEL } from "@/lib/room-development";
import { usePaintingProgress } from "@/store/usePaintingProgress";
import { ArtworkLibrary } from "./ArtworkLibrary";
import { ArtworkStory } from "./ArtworkStory";
import { RoomDecorations } from "./RoomDecorations";
import { EraLockedNotice, MilestoneNotice, type Milestone } from "./ProgressNotices";
import { getNewDecorations, getRoomArtworkPlacement } from "@/data/room-decorations";

const noRewards: string[] = [];
const devToolsEnabled = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "1";

type Panel =
  | { type: "settings" | "info" }
  | { type: "story" | "studio"; artwork: Artwork }
  | { type: "locked"; eraId: EraId }
  | { type: "milestone"; milestone: Milestone };
const eraIds = eras.map((era) => era.id);
const regionStyle = (region: Region): CSSProperties => ({
  left: `${region.x}%`,
  top: `${region.y}%`,
  width: `${region.width}%`,
  height: `${region.height}%`,
});
const hallDoorStyle = (region: Region): CSSProperties => ({
  ...regionStyle(region),
  left: `${region.x + region.width / 2}%`,
  transform: "translateX(-50%)",
});
const noteUrl = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/note.svg`;
const subscribeFullscreen = (notify: () => void) => {
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
};
const readFullscreenAvailable = () => document.fullscreenEnabled === true;
const readFullscreen = () => Boolean(document.fullscreenElement);
const serverFullscreen = () => false;

function GameScene({
  children,
  reducedMotion,
}: {
  children: React.ReactNode;
  reducedMotion: boolean;
}) {
  const present = useIsPresent();
  return (
    <motion.section
      className="game-scene"
      aria-hidden={!present}
      inert={!present}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.05 : 0.28 }}
    >
      {children}
    </motion.section>
  );
}

/** Supply the teammate's coloring component through onRestoreArtwork. */
export function HeritageApp({
  onRestoreArtwork,
}: {
  onRestoreArtwork?: (request: RestoreArtworkRequest) => void;
}) {
  const { view, navigate } = useSceneNavigation();
  const language = useGameStore((state) => state.language);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const completed = useGameStore((state) => state.completedArtworkIds);
  const completeArtwork = useGameStore((state) => state.completeArtwork);
  const wallAssignments = useGameStore((state) => state.wallAssignments);
  const setWallArtwork = useGameStore((state) => state.setWallArtwork);
  const gentleMotion = useGameStore((state) => state.gentleMotion);
  const toggleGentleMotion = useGameStore((state) => state.toggleGentleMotion);
  const autoFill = useGameStore((state) => state.autoFill);
  const toggleAutoFill = useGameStore((state) => state.toggleAutoFill);
  const exploreAll = useGameStore((state) => state.exploreAll);
  const toggleExploreAll = useGameStore((state) => state.toggleExploreAll);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const savedPaintings = usePaintingProgress((state) => state.paintings);
  const [hydrated, setHydrated] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const lockedRedirect = useRef<EraId | null>(null);
  const reducedMotion = useReducedMotion() || gentleMotion;
  const t = copy[language];
  const [panel, setPanel] = useState<Panel | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [previewFinishedRoom, setPreviewFinishedRoom] = useState(false);
  const roomPreview = devToolsEnabled && previewFinishedRoom;
  const [pendingRewards, setPendingRewards] = useState<Partial<Record<EraId, string[]>>>({});
  const consumeRewards = useCallback((ids: string[]) => {
    setPendingRewards((current) => Object.fromEntries(Object.entries(current).map(([era, rewards]) => [era, rewards.filter((id) => !ids.includes(id))])));
  }, []);
  const [libraryContext, setLibraryContext] = useState<{ eraId?: EraId; slotId?: string; returnView: Exclude<View, "library"> }>({ returnView: "home" });
  const fullscreenAvailable = useSyncExternalStore(
    subscribeFullscreen, readFullscreenAvailable, serverFullscreen,
  );
  const fullscreen = useSyncExternalStore(
    subscribeFullscreen, readFullscreen, serverFullscreen,
  );
  const appRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousView = useRef(view);
  const closePanel = useCallback(() => {
    setPanel(null);
    setResetConfirm(false);
  }, []);
  const activeEra = isEraId(view) ? getEra(view) : null;
  const eraIndex = activeEra
    ? eras.findIndex((era) => era.id === activeEra.id)
    : -1;
  const roomProgress = activeEra ? getRoomProgress(activeEra.id, artworks, completed) : null;
  const roomLevel = roomPreview ? MAX_ROOM_LEVEL : roomProgress?.level ?? 0;
  const completedRooms = eras.filter((era) => getRoomProgress(era.id, artworks, completed).isComplete).length;
  const eraAccess = getEraAccess(eraIds, artworks, completed);
  const isEraOpen = (eraId: EraId) => exploreAll || eraAccess[eraId].unlocked;
  const hallStage = Math.min(completedRooms + 1, eras.length);
  const hallEra = eras[hallStage - 1];
  const hallLayout = halls[hallStage - 1];
  const houseImage = assetUrl(`house${completedRooms}.jpg`);
  const hallImageName =
    assetManifest.find((file) =>
      new RegExp(`^${hallLayout.image}\\.(jpg|jpeg|png|webp)$`, "i").test(file),
    ) ||
    assetManifest.find((file) => /^hall\.(jpg|jpeg|png|webp)$/i.test(file));
  const sceneImage = activeEra
    ? assetUrl(activeEra.image)
    : view === "hall" && hallImageName
      ? assetUrl(hallImageName)
      : houseImage;

  useEffect(() => {
    void Promise.all([useGameStore.persist.rehydrate(), usePaintingProgress.persist.rehydrate()]).then(() => setHydrated(true));
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    const handler = () => setStorageUnavailable(true);
    window.addEventListener("heritage:storage-unavailable", handler);
    return () =>
      window.removeEventListener("heritage:storage-unavailable", handler);
  }, []);
  useEffect(() => {
    if (view !== previousView.current) {
      closePanel();
      mainRef.current?.focus({ preventScroll: true });
      previousView.current = view;
      if (lockedRedirect.current) {
        setPanel({ type: "locked", eraId: lockedRedirect.current });
        lockedRedirect.current = null;
      }
    }
  }, [view, closePanel]);
  const blockedEraId = hydrated && activeEra && !isEraOpen(activeEra.id) ? activeEra.id : null;
  useEffect(() => {
    // A bookmarked or typed address must not skip the era order.
    if (!blockedEraId) return;
    lockedRedirect.current = blockedEraId;
    navigate("hall", { replace: true });
  }, [blockedEraId, navigate]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await appRef.current?.requestFullscreen();
    } catch {
      /* The viewport remains immersive when the browser declines fullscreen. */
    }
  };
  const goToEra = (eraId: EraId) => {
    if (isEraOpen(eraId)) navigate(eraId);
    else setPanel({ type: "locked", eraId });
  };
  const restoreArtwork = (artwork: Artwork) => {
    closePanel();
    if (!isEraOpen(artwork.eraId)) {
      setPanel({ type: "locked", eraId: artwork.eraId });
      return;
    }
    if (onRestoreArtwork && artwork.coloringArtworkId)
      onRestoreArtwork({
        artwork,
        era: getEra(artwork.eraId),
        language,
        onComplete: () => {
          const completedBefore = useGameStore.getState().completedArtworkIds;
          const before = getRoomProgress(artwork.eraId, artworks, completedBefore);
          const accessBefore = getEraAccess(eraIds, artworks, completedBefore);
          completeArtwork(artwork.id);
          const completedAfter = useGameStore.getState().completedArtworkIds;
          const after = getRoomProgress(artwork.eraId, artworks, completedAfter);
          const accessAfter = getEraAccess(eraIds, artworks, completedAfter);
          const newObjects = getNewDecorations(artwork.eraId, before.level, after.level).map(({ id }) => id);
          if (newObjects.length) setPendingRewards((current) => ({ ...current, [artwork.eraId]: [...new Set([...(current[artwork.eraId] ?? []), ...newObjects])] }));
          // Shown one by one after the story; the progress itself is already saved.
          const reached: Milestone[] = [];
          if (!before.isComplete && after.isComplete) {
            const finale = eraIds.every((eraId) => getRoomProgress(eraId, artworks, completedAfter).isComplete);
            reached.push(finale ? { type: "finale" } : { type: "eraComplete", eraId: artwork.eraId });
          }
          if (!exploreAll) for (const eraId of eraIds) if (!accessBefore[eraId].unlocked && accessAfter[eraId].unlocked) reached.push({ type: "unlock", eraId });
          if (reached.length) setMilestones((current) => [...current, ...reached]);
          setPanel({ type: "story", artwork });
        },
        onClose: closePanel,
      });
    else setPanel({ type: "studio", artwork });
  };
  const dismissPanel = () => {
    const [next, ...rest] = milestones;
    if (next && panel?.type !== "settings" && panel?.type !== "info") {
      setResetConfirm(false);
      setMilestones(rest);
      setPanel({ type: "milestone", milestone: next });
    } else closePanel();
  };
  const openLibrary = (eraId?: EraId, slotId?: string) => {
    setLibraryContext({ eraId, slotId, returnView: activeEra?.id ?? (view === "hall" ? "hall" : "home") });
    navigate("library");
  };
  const openArtwork = (artwork: Artwork, slotId: string) => {
    if (roomPreview || completed.includes(artwork.id)) {
      openLibrary(artwork.eraId, slotId);
      return;
    }
    restoreArtwork(artwork);
  };

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <div
        ref={appRef}
        className={`heritage-app view-${view === "home" ? "home" : "interior"} ${gentleMotion ? "gentle-motion" : ""}`}
        style={
          {
            "--era-accent": activeEra?.accent || hallEra.accent,
          } as CSSProperties
        }
      >
        <a
          className="skip-link"
          href="#main"
          onClick={(event) => {
            event.preventDefault();
            mainRef.current?.focus();
          }}
        >
          {t.skip}
        </a>
        <div
          className="ambient-backdrop"
          style={{ backgroundImage: `url(${sceneImage})` }}
          aria-hidden="true"
        />
        <header className="site-header glass">
          <div className="header-left">
            {view !== "home" && (
              <button
                className="icon-button back-button"
                aria-label={view === "library" ? t.back : view === "hall" ? t.toHouse : t.toHall}
                onClick={() => navigate(view === "library" ? libraryContext.returnView : view === "hall" ? "home" : "hall")}
              >
                <ArrowLeft size={19} />
              </button>
            )}
            <button
              className="brand"
              onClick={() => navigate("home")}
              aria-label={`${t.brand} — ${t.home}`}
            >
              <span className="brand-symbol">
                <House size={21} strokeWidth={1.4} />
                <span />
              </span>
              <span className="brand-type">
                {t.brand}
              </span>
            </button>
          </div>
          {view === "home" ? (
            <nav className="header-navigation" aria-label={t.rooms}>
              <button className="active" onClick={() => navigate("home")}>
                {t.home}
              </button>
              <button onClick={() => navigate("hall")}>{t.rooms}</button>
              <button onClick={() => openLibrary()}>{t.library}</button>
            </nav>
          ) : (
            <div className="header-context">
              <span className="eyebrow">
                {activeEra
                  ? `${t.chapter} ${activeEra.numeral} / IV`
                  : view === "library" ? t.libraryEyebrow : `${t.hallChapter} ${hallEra.numeral} / IV`}
              </span>
              <h1>{activeEra ? activeEra.name[language] : view === "library" ? t.library : t.hall}</h1>
            </div>
          )}
          <div className="header-controls">
            <button
              className="language-button"
              onClick={() => setLanguage(language === "pl" ? "en" : "pl")}
              aria-label={t.language}
            >
              {language.toUpperCase()}
            </button>
            {fullscreenAvailable && (
              <button
                className="icon-button fullscreen-button"
                aria-label={fullscreen ? t.exitFullscreen : t.fullscreen}
                onClick={() => void toggleFullscreen()}
              >
                {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            )}
            <button
              className="icon-button info-button"
              aria-label={t.info}
              onClick={() => setPanel({ type: "info" })}
            >
              <Info size={18} />
            </button>
            <button
              className="icon-button"
              aria-label={t.settings}
              onClick={() => setPanel({ type: "settings" })}
            >
              <Settings2 size={19} />
            </button>
          </div>
        </header>
        <main id="main" ref={mainRef} tabIndex={-1}>
          <AnimatePresence mode="wait" initial={false}>
            <GameScene key={view} reducedMotion={Boolean(reducedMotion)}>
              {view === "library" ? (
                <ArtworkLibrary
                  key={`${libraryContext.eraId ?? "all"}-${libraryContext.slotId ?? "all"}`}
                  eraId={libraryContext.eraId}
                  slotId={libraryContext.slotId}
                  onRestore={restoreArtwork}
                  isEraOpen={isEraOpen}
                  onHang={(slotId, artwork) => {
                    setWallArtwork(slotId, artwork.id);
                    navigate(artwork.eraId);
                  }}
                />
              ) : <>
              <GameViewport
                key={roomPreview ? "preview" : "game"}
                fixedOverview={Boolean(activeEra && roomPreview)}
                lockCamera={view === "home" || view === "hall"}
                className={
                  view === "home"
                    ? "home-canvas"
                    : view === "hall"
                      ? "hall-canvas"
                      : "room-canvas"
                }
                focalY={activeEra ? 0.43 : 0.52}
                label={
                  activeEra
                    ? activeEra.name[language]
                    : view === "hall"
                      ? t.hall
                      : t.home
                }
              >
                {activeEra && roomProgress ? (
                  <RoomBackdrop
                    key={activeEra.id}
                    baseImage={activeEra.image}
                    level={roomLevel}
                    alt={activeEra.name[language]}
                  />
                ) : view === "hall" && !hallImageName ? (
                  <HallBackdrop stage={hallStage} />
                ) : (
                  <SceneImage
                    key={sceneImage}
                    src={sceneImage}
                    alt={
                      activeEra
                        ? activeEra.name[language]
                        : view === "hall"
                          ? t.hall
                          : t.home
                    }
                  />
                )}
                <div className="scene-light" aria-hidden="true" />
                {view === "home" ? (
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
                ) : view === "hall" ? (
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
                ) : (
                  activeEra && (
                    <>
                      <RoomDecorations eraId={activeEra.id} level={roomLevel} language={language} gentle={Boolean(reducedMotion)} active={!panel} pendingIds={roomPreview ? noRewards : pendingRewards[activeEra.id] ?? noRewards} onRewardsShown={consumeRewards} />
                      {getWallArtworks(activeEra.id, wallAssignments)
                        .map(({ artwork, slot }) => {
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
                                setPanel({ type: "story", artwork })
                              }
                              aria-label={`${t.story} — ${artwork.title[language]}`}
                            >
                              <BookOpen size={12} />
                              <span>
                                {String(slot.number).padStart(2, "0")}
                              </span>
                            </button>
                          </div>
                        ); })}
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
                    </>
                  )
                )}
              </GameViewport>
              {view === "home" ? (
                <>
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
                    {completed.length} / {artworks.length}
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
                </>
              ) : (
                <>
                  {activeEra && roomProgress && (
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
                        onClick={() => setPreviewFinishedRoom((current) => !current)}
                      >
                        <Sparkles size={14} aria-hidden="true" />
                        {roomPreview ? t.devRoomPreviewOff : t.devRoomPreview}
                      </button>}
                    </div>
                  )}
                  <nav className="era-switcher glass" aria-label={t.rooms}>
                    {activeEra && <button className="room-library-toggle icon-button" aria-label={t.changePaintings} onClick={() => openLibrary(activeEra.id)}><Images size={19} /></button>}
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
                </>
              )}
              </>}
            </GameScene>
          </AnimatePresence>
        </main>
        {storageUnavailable && (
          <div className="storage-notice glass" role="status">
            {t.savedError}
          </div>
        )}

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
                          ? panel.milestone.type === "unlock" ? t.unlockTitle : panel.milestone.type === "eraComplete" ? t.eraCompleteTitle : t.finaleTitle
                          : t.studioTitle
              }
              closeLabel={t.close}
              onClose={dismissPanel}
              gentle={gentleMotion}
              variant={panel.type === "story" ? "story" : "default"}
            >
              {panel.type === "settings" ? (
                <>
                  <p className="dialog-intro">{t.preferences}</p>
                  <div className="setting-row">
                    <span>Language / Język</span>
                    <div className="segmented-control">
                      <button
                        aria-pressed={language === "pl"}
                        onClick={() => setLanguage("pl")}
                      >
                        PL
                      </button>
                      <button
                        aria-pressed={language === "en"}
                        onClick={() => setLanguage("en")}
                      >
                        EN
                      </button>
                    </div>
                  </div>
                  <div className="setting-row">
                    <span>{t.reducedMotion}</span>
                    <button
                      role="switch"
                      aria-checked={gentleMotion}
                      aria-label={t.reducedMotion}
                      className={`toggle ${gentleMotion ? "on" : ""}`}
                      onClick={toggleGentleMotion}
                    >
                      <span />
                    </button>
                  </div>
                  <div className="setting-row">
                    <span id="auto-fill-label">{t.autoFill}</span>
                    <button
                      role="switch"
                      aria-checked={autoFill}
                      aria-labelledby="auto-fill-label"
                      aria-describedby="auto-fill-description"
                      className={`toggle ${autoFill ? "on" : ""}`}
                      onClick={toggleAutoFill}
                    >
                      <span />
                    </button>
                  </div>
                  <p id="auto-fill-description" className="dialog-intro">{t.autoFillDescription}</p>
                  <div className="setting-row">
                    <span id="explore-all-label">{t.exploreAll}</span>
                    <button
                      role="switch"
                      aria-checked={exploreAll}
                      aria-labelledby="explore-all-label"
                      aria-describedby="explore-all-description"
                      className={`toggle ${exploreAll ? "on" : ""}`}
                      onClick={toggleExploreAll}
                    >
                      <span />
                    </button>
                  </div>
                  <p id="explore-all-description" className="dialog-intro">{t.exploreAllDescription}</p>
                  <p className="save-note">
                    <Check size={14} />
                    {storageUnavailable ? t.savedError : t.saved}
                  </p>
                  {resetConfirm ? (
                    <div className="reset-confirm">
                      <p>{t.resetAsk}</p>
                      <div>
                        <button
                          className="secondary-button"
                          onClick={() => setResetConfirm(false)}
                        >
                          {t.cancel}
                        </button>
                        <button
                          className="danger-button"
                          onClick={() => {
                            resetProgress();
                            usePaintingProgress.getState().reset();
                            setPreviewFinishedRoom(false);
                            setPendingRewards({});
                            setMilestones([]);
                            closePanel();
                          }}
                        >
                          {t.confirm}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="reset-link"
                      onClick={() => setResetConfirm(true)}
                    >
                      {t.reset}
                    </button>
                  )}
                </>
              ) : panel.type === "info" ? (
                <>
                  <div className="dialog-illustration">
                    <House size={42} strokeWidth={1} />
                    <Sparkles size={19} />
                  </div>
                  <p className="dialog-intro">{t.infoBody}</p>
                  <button
                    className="primary-button full-width"
                    onClick={() => {
                      closePanel();
                      navigate("hall");
                    }}
                  >
                    {t.explore}
                    <ArrowRight size={18} />
                  </button>
                </>
              ) : panel.type === "story" ? (
                <ArtworkStory
                  key={panel.artwork.id}
                  artwork={panel.artwork}
                  language={language}
                  completed={completed.includes(panel.artwork.id)}
                  onRestore={onRestoreArtwork ? () => restoreArtwork(panel.artwork) : undefined}
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
                    setMilestones([]);
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
      </div>
    </MotionConfig>
  );
}
