"use client";

import { copy } from "@/data/copy";
import type { Language } from "@/types/game";
import { Check } from "lucide-react";
import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";

export function SettingsPanel({ language, storageUnavailable, onReset, onInfo }: {
  onInfo:()=>void;
  language: Language; storageUnavailable: boolean; onReset: () => void;
}) {
  const t = copy[language];
  const { setLanguage, analyticsEnabled, toggleAnalytics, musicEnabled, musicVolume, brushSounds, toggleMusic, setMusicVolume, toggleBrushSounds, highContrast, toggleHighContrast, gentleMotion, toggleGentleMotion, autoFill, toggleAutoFill, exploreAll, toggleExploreAll } = useGameStore();
  const [resetConfirm, setResetConfirm] = useState(false);
  return (<>
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
                  <div className="setting-row">
                    <span>{t.highContrast}</span>
                    <button role="switch" aria-label={t.highContrast} aria-checked={highContrast} className={`toggle ${highContrast ? "on" : ""}`} onClick={toggleHighContrast}><span /></button>
                  </div>
                  <div className="setting-row"><span>{t.music}</span><button role="switch" aria-label={t.music} aria-checked={musicEnabled} className={`toggle ${musicEnabled ? "on" : ""}`} onClick={toggleMusic}><span/></button></div>
                  <label className="setting-row"><span>{t.musicVolume}</span><input type="range" min="0" max="100" step="5" value={Math.round(musicVolume*100)} aria-label={t.musicVolume} onChange={event=>setMusicVolume(Number(event.target.value)/100)}/></label>
                  <div className="setting-row"><span>{t.brushSounds}</span><button role="switch" aria-label={t.brushSounds} aria-checked={brushSounds} className={`toggle ${brushSounds ? "on" : ""}`} onClick={toggleBrushSounds}><span/></button></div>
                  <div className="setting-row"><span>{t.analytics}</span><button role="switch" aria-label={t.analytics} aria-checked={analyticsEnabled} className={`toggle ${analyticsEnabled ? "on" : ""}`} onClick={toggleAnalytics}><span/></button></div>
                  <button className="secondary-button full-width" onClick={onInfo}>{t.info}</button>
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
                            onReset();
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
  </>);
}
