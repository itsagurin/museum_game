"use client";
import { content, eras } from "@/data/eras";
import { getBadges } from "@/lib/badges";
import { copy } from "@/data/copy";
import type { Language } from "@/types/game";
export function CollectionAlbum({language,completed}: {language:Language;completed:string[]}) {
  const t=copy[language],badges=getBadges(content,completed),done=new Set(completed);
  const artists=[...new Set(content.map(entry=>entry.artist))].sort();
  return <div className="collection-album">
    <h2>{t.albumEras}</h2><div className="album-era-grid">{eras.map(era=>{const works=content.filter(entry=>entry.era===era.id),count=works.filter(entry=>done.has(entry.id)).length;return <div key={era.id}><strong>{era.name[language]}</strong><span>{count} / {works.length}</span><progress aria-label={era.name[language]} value={count} max={works.length} /></div>;})}</div>
    <h2>{t.albumArtists}</h2><ul className="album-artists">{artists.map(artist=>{const works=content.filter(entry=>entry.artist===artist);return <li key={artist}><span>{artist}</span><span>{works.filter(entry=>done.has(entry.id)).length} / {works.length}</span></li>;})}</ul>
    <h2>{t.albumBadges}</h2><div className="album-badges">{badges.map(badge=><article key={badge.id} className={`album-badge ${badge.earned ? "earned" : "locked"}`} data-badge={badge.id} data-earned={badge.earned}><h3>{badge.title[language]}</h3><p>{badge.description[language]}</p><span>{badge.earned ? t.badgeEarned : `${badge.progress} / ${badge.total}`}</span></article>)}</div>
  </div>;
}
