"use client";

import { musicTracks } from "@/lib/music";
import { copy } from "@/data/copy";
import type { Language } from "@/types/game";
import { House, Sparkles, ArrowRight } from "lucide-react";

export function InfoPanel({ language, onExplore }: {
  language: Language; onExplore: () => void;
}) {
  const t = copy[language];
  return (<>
                  <div className="dialog-illustration">
                    <House size={42} strokeWidth={1} />
                    <Sparkles size={19} />
                  </div>
                  <p className="dialog-intro">{t.infoBody}</p>
                  <section className="music-credits"><h3>{t.music}</h3><ul>{musicTracks.map(track=><li key={track.id}><strong>{track.title[language]}</strong> · {track.composer} · {track.performer} · <a href={track.source} target="_blank" rel="noreferrer">{t.recordingSource}</a> · <a href={track.licenseUrl} target="_blank" rel="noreferrer">CC0</a></li>)}</ul></section>
                  <button
                    className="primary-button full-width"
                    onClick={onExplore}
                  >
                    {t.explore}
                    <ArrowRight size={18} />
                  </button>
  </>);
}
