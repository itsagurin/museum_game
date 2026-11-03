"use client";

import { copy } from "@/data/copy";
import type { Language, View } from "@/types/game";
import { ArrowLeft, House, Minimize, Maximize, Info, Settings2 } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import type { Era } from "@/types/game";

export function AppHeader({ view, activeEra, hallEra, language, returnView, navigate, openLibrary, fullscreenAvailable, fullscreen, toggleFullscreen, openPanel }: {
  view: View; activeEra: Era | null; hallEra: Era; language: Language;
  returnView: Exclude<View, "library">; navigate: (view: View) => void;
  openLibrary: () => void; fullscreenAvailable: boolean; fullscreen: boolean;
  toggleFullscreen: () => Promise<void>; openPanel: (type: "info" | "settings") => void;
}) {
  const t = copy[language];
  const setLanguage = useGameStore((state) => state.setLanguage);
  return (
        <header className="site-header glass">
          <div className="header-left">
            {view !== "home" && (
              <button
                className="icon-button back-button"
                aria-label={view === "library" ? t.back : view === "hall" ? t.toHouse : t.toHall}
                onClick={() => navigate(view === "library" ? returnView : view === "hall" ? "home" : "hall")}
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
              onClick={() => openPanel("info")}
            >
              <Info size={18} />
            </button>
            <button
              className="icon-button"
              aria-label={t.settings}
              onClick={() => openPanel("settings")}
            >
              <Settings2 size={19} />
            </button>
          </div>
        </header>
  );
}
