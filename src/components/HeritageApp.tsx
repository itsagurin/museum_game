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
import { getRoomProgress, MAX_ROOM_LEVEL } from "@/lib/room-development";
import { ArtworkLibrary } from "./ArtworkLibrary";

type Panel =
  | { type: "settings" | "info" }
  | { type: "story" | "studio"; artwork: Artwork };
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
  const resetProgress = useGameStore((state) => state.resetProgress);
  const reducedMotion = useReducedMotion() || gentleMotion;
  const t = copy[language];
  const [panel, setPanel] = useState<Panel | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
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
  const completedRooms = eras.filter((era) => getRoomProgress(era.id, artworks, completed).isComplete).length;
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
    void useGameStore.persist.rehydrate();
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
    }
  }, [view, closePanel]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await appRef.current?.requestFullscreen();
    } catch {
      /* The viewport remains immersive when the browser declines fullscreen. */
    }
  };
  const restoreArtwork = (artwork: Artwork) => {
    closePanel();
    if (onRestoreArtwork && artwork.coloringArtworkId)
      onRestoreArtwork({
        artwork,
        era: getEra(artwork.eraId),
        language,
        onComplete: () => {
          completeArtwork(artwork.id);
          setPanel({ type: "story", artwork });
        },
        onClose: closePanel,
      });
    else setPanel({ type: "studio", artwork });
  };
  const openLibrary = (eraId?: EraId, slotId?: string) => {
    setLibraryContext({ eraId, slotId, returnView: activeEra?.id ?? (view === "hall" ? "hall" : "home") });
    navigate("library");
  };
  const openArtwork = (artwork: Artwork, slotId: string) => {
    if (completed.includes(artwork.id)) {
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
                <small>{t.tagline}</small>
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
                  onHang={(slotId, artwork) => {
                    setWallArtwork(slotId, artwork.id);
                    navigate(artwork.eraId);
                  }}
                />
              ) : <>
              <GameViewport
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
                    level={roomProgress.level}
                    alt={activeEra.name[language]}
                    gentle={Boolean(reducedMotion)}
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
                    style={regionStyle({ x: 44, y: 51, width: 15, height: 17 })}
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
                      className="hall-door-hit"
                      data-era={era.id}
                      data-depth={index === 1 || index === 2 ? "far" : "near"}
                      style={hallDoorStyle(
                        hallImageName
                          ? hallLayout.doors[era.id]
                          : fallbackHallDoors[era.id],
                      )}
                      onClick={() => navigate(era.id)}
                      aria-label={era.name[language]}
                    >
                      <span className="era-door-number glass">
                        {era.numeral}
                      </span>
                      <span className="era-door-label glass">
                        {era.name[language]}
                        <ArrowUpRight size={14} />
                      </span>
                    </button>
                  ))
                ) : (
                  activeEra && (
                    <>
                      {getWallArtworks(activeEra.id, wallAssignments)
                        .map(({ artwork, slot }) => (
                          <div
                            key={slot.id}
                            data-slot-id={slot.id}
                            className={`wall-artwork wall-${slot.placement.wall}`}
                            style={{
                              ...regionStyle(slot.placement),
                              ...artworkProjection(slot.placement, activeEra.wallPerspective[slot.placement.wall]),
                            }}
                          >
                            <button
                              className="painting-frame"
                              onClick={() => openArtwork(artwork, slot.id)}
                              aria-label={`${artwork.title[language]} — ${completed.includes(artwork.id) ? t.restoredLabel : t.awaiting}`}
                            >
                              <span className="paper-crop">
                                {completed.includes(artwork.id) && artwork.originalImage ? (
                                  <RestoredArtwork key={artwork.id} artwork={artwork} />
                                ) : (
                                  <img src={assetUrl("blank_paper_crossmark.jpg")} alt="" draggable={false} className="unrestored-paper" />
                                )}
                              </span>
                              {completed.includes(artwork.id) &&
                                artwork.originalImage && (
                                  <span className="completed-mark">
                                    <Check size={11} />
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
                        ))}
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
                          navigate(
                            eraIndex === eras.length - 1
                              ? "hall"
                              : eras[eraIndex + 1].id,
                          )
                        }
                        aria-label={
                          eraIndex === eras.length - 1
                            ? t.toHall
                            : `${t.next}: ${eras[eraIndex + 1].name[language]}`
                        }
                      >
                        <span className="door-route glass">
                          {eraIndex === eras.length - 1
                            ? t.hall
                            : eras[eraIndex + 1].numeral}
                          <ChevronRight size={15} />
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
                  <div className="room-status glass">
                    {activeEra && roomProgress ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <DoorOpen size={15} />
                        <span>{t.hallHint}</span>
                      </>
                    )}
                  </div>
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
                        className={`era-switch ${view === era.id ? "selected" : ""}`}
                        aria-label={era.name[language]}
                        aria-current={view === era.id ? "page" : undefined}
                        onClick={() => navigate(era.id)}
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
                      ? t.story
                      : t.studioTitle
              }
              closeLabel={t.close}
              onClose={closePanel}
              gentle={gentleMotion}
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
                <>
                  <div className="story-heading">
                    <span className="story-icon">
                      <BookOpen size={23} />
                    </span>
                    <div>
                      <span className="eyebrow">
                        {getEra(panel.artwork.eraId).name[language]}
                      </span>
                      <h3>{panel.artwork.title[language]}</h3>
                    </div>
                  </div>
                  <p className="story-body">
                    {panel.artwork.story?.[language] || t.emptyStory}
                  </p>
                  <div className="fun-fact">
                    <Sparkles size={18} />
                    <div>
                      <h4>{t.fact}</h4>
                      <p>{panel.artwork.funFact?.[language] || t.emptyFact}</p>
                    </div>
                  </div>
                  {panel.artwork.coloringArtworkId && onRestoreArtwork && (
                    <button
                      className="primary-button full-width story-restore"
                      onClick={() => restoreArtwork(panel.artwork)}
                    >
                      {completed.includes(panel.artwork.id) ? t.repaint : t.restore}
                      <Paintbrush size={16} />
                    </button>
                  )}
                  <button
                    className="secondary-button full-width"
                    onClick={closePanel}
                  >
                    {t.returnRoom}
                    <ArrowRight size={16} />
                  </button>
                </>
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
