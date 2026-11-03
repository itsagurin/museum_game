import { copy } from "@/data/copy";
import type { Artwork, Language } from "@/types/game";

/** Credits the reproduction with a link to its source and licence. */
export function ArtworkSourceNote({ artwork, language }: { artwork: Artwork; language: Language }) {
  const source = artwork.source;
  if (!source) return null;
  const t = copy[language];
  return (
    <p className="artwork-source">
      {t.sourceLabel}:{" "}
      <a href={source.url} target="_blank" rel="noopener noreferrer">{source.institution ?? source.title}</a>
      {source.author && <>{" · "}{t.photoBy} {source.author}</>}
      {" · "}
      {source.licenseUrl ? <a href={source.licenseUrl} target="_blank" rel="noopener noreferrer">{source.license}</a> : source.license}
    </p>
  );
}
