"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, ImageOff, Paintbrush, Search, X } from "lucide-react";
import { artworks, eras, getEra, getWallArtworks, wallSlots } from "@/data/eras";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import type { Artwork, EraId } from "@/types/game";

function ArtworkPreview({ artwork, eager = false }: { artwork: Artwork; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const language = useGameStore((state) => state.language);
  if (failed || !artwork.originalImage) return <span className="library-image-fallback" role="img" aria-label={copy[language].imageError}><ImageOff size={28} /></span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={artwork.originalImage} alt="" loading={eager ? "eager" : "lazy"} draggable={false} onError={() => setFailed(true)} />
  );
}

const searchKey = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/gi, "l").toLowerCase();

export function ArtworkLibrary({ eraId, slotId, onHang, onRestore }: {
  eraId?: EraId;
  slotId?: string;
  onHang: (slotId: string, artwork: Artwork) => void;
  onRestore: (artwork: Artwork) => void;
}) {
  const language = useGameStore((state) => state.language);
  const completed = useGameStore((state) => state.completedArtworkIds);
  const assignments = useGameStore((state) => state.wallAssignments);
  const t = copy[language];
  const [filter, setFilter] = useState<EraId | "all">(eraId ?? "all");
  const [onlyCompleted, setOnlyCompleted] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [targetSlotId, setTargetSlotId] = useState(slotId ?? "");
  const scrollRef = useRef<HTMLDivElement>(null);
  const detailBackRef = useRef<HTMLButtonElement>(null);
  const gridScrollRef = useRef(0);
  const previousSelection = useRef<string | null>(null);
  const selected = artworks.find((artwork) => artwork.id === selectedId);
  const collection = artworks.filter((artwork) => (!eraId || artwork.eraId === eraId) && (filter === "all" || artwork.eraId === filter));
  const visible = collection.filter((artwork) => (!onlyCompleted || completed.includes(artwork.id)) && searchKey(`${artwork.title[language]} ${artwork.artist ?? ""} ${artwork.year ?? ""} ${getEra(artwork.eraId).name[language]} ${artwork.sourceFile ?? ""}`).includes(searchKey(query.trim())));
  const hangingIds = new Set(Object.values(assignments));
  const selectedSlots = selected ? wallSlots.filter((slot) => slot.eraId === selected.eraId) : [];
  const targetSlot = selectedSlots.find((slot) => slot.id === targetSlotId) ?? selectedSlots[0];
  const alreadyHere = selected && targetSlot && assignments[targetSlot.id] === selected.id;

  useEffect(() => {
    if (selectedId) {
      scrollRef.current?.scrollTo(0, 0);
      detailBackRef.current?.focus({ preventScroll: true });
    } else if (previousSelection.current) {
      scrollRef.current?.scrollTo(0, gridScrollRef.current);
      const previousCard = Array.from(scrollRef.current?.querySelectorAll<HTMLButtonElement>(".library-artwork-card") ?? []).find((card) => card.dataset.artworkId === previousSelection.current);
      previousCard?.focus({ preventScroll: true });
    }
    previousSelection.current = selectedId;
  }, [selectedId]);

  return (
    <div className="library-view">
      <div className="library-scroll" ref={scrollRef}>
        <div className="library-content">
          <div className="library-intro">
            <span className="eyebrow">{eraId ? getEra(eraId).name[language] : t.libraryEyebrow}</span>
            <p>{eraId ? t.librarySameEra : t.libraryIntro}</p>
            <span className="library-count">{collection.length} {t.paintings} <span>·</span> {collection.filter((artwork) => completed.includes(artwork.id)).length} {t.restored}</span>
          </div>

          {selected ? (
            <section className="library-detail" aria-label={`${selected.title[language]} — ${getEra(selected.eraId).name[language]}`} data-artwork-id={selected.id}>
              <button ref={detailBackRef} className="library-back-button" onClick={() => setSelectedId(null)}><ArrowLeft size={16} />{t.libraryBack}</button>
              <div className="library-detail-layout">
                <div className="library-detail-image"><ArtworkPreview key={selected.id} artwork={selected} eager /></div>
                <div className="library-detail-copy glass">
                  <span className="eyebrow">{getEra(selected.eraId).name[language]}</span>
                  <h2>{selected.title[language]}</h2>
                  {selected.artist && <p className="artwork-credit">{selected.artist}{selected.year && ` · ${selected.year}`}</p>}
                  {selected.style && <p className="library-artwork-style" lang={selected.contentLanguage}>{selected.style}</p>}
                  <span className={`library-state ${completed.includes(selected.id) ? "restored" : ""}`}>{completed.includes(selected.id) ? <Check size={14} /> : <Paintbrush size={14} />}{completed.includes(selected.id) ? t.restoredLabel : t.awaiting}</span>
                  <label className="library-slot-label">
                    {t.wallPosition}
                    <select aria-label={t.wallPosition} value={targetSlot?.id ?? ""} onChange={(event) => setTargetSlotId(event.target.value)}>
                      {getWallArtworks(selected.eraId, assignments).map(({ slot, artwork }) => <option key={slot.id} value={slot.id}>{t.wallSlot} {slot.number} — {artwork.title[language]}</option>)}
                    </select>
                  </label>
                  {!completed.includes(selected.id) && <p className="library-detail-hint">{t.unpaintedHang}</p>}
                  {hangingIds.has(selected.id) && !alreadyHere && <p className="library-detail-hint">{t.hangingSwap}</p>}
                  <button className="primary-button full-width" disabled={Boolean(alreadyHere) || !targetSlot} onClick={() => targetSlot && onHang(targetSlot.id, selected)}>{alreadyHere ? t.alreadyHanging : t.hangPainting}<ArrowUpRight size={18} /></button>
                  {selected.coloringArtworkId ? <button className="secondary-button full-width" onClick={() => onRestore(selected)}><Paintbrush size={16} />{completed.includes(selected.id) ? t.repaint : t.restore}</button> : <p className="library-studio-note">{t.coloringSoon}</p>}
                </div>
              </div>
            </section>
          ) : (
            <>
              {!eraId && <div className="library-era-filters" role="group" aria-label={t.rooms}>
                <button className="library-filter" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{t.libraryAll}</button>
                {eras.map((era) => <button key={era.id} className="library-filter" aria-pressed={filter === era.id} onClick={() => setFilter(era.id)}>{era.name[language]}</button>)}
              </div>}
              <div className="library-toolbar">
                <label className="library-search glass"><Search size={17} /><input type="search" aria-label={t.librarySearch} placeholder={t.librarySearchPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button aria-label={t.libraryClearSearch} onClick={() => setQuery("")}><X size={16} /></button>}</label>
                <button className="library-completed-filter glass" aria-pressed={onlyCompleted} onClick={() => setOnlyCompleted((value) => !value)}><Check size={15} />{t.libraryCompleted}</button>
              </div>
              <div className="library-results" aria-live="polite">{visible.length} {t.paintings}</div>
              {visible.length ? <div className="library-grid">
                {visible.map((artwork) => <button key={artwork.id} className="library-artwork-card" data-artwork-id={artwork.id} aria-label={`${artwork.title[language]} — ${getEra(artwork.eraId).name[language]}`} onClick={() => { gridScrollRef.current = scrollRef.current?.scrollTop ?? 0; setSelectedId(artwork.id); setTargetSlotId(slotId ?? ""); }}>
                  <span className="library-card-image"><ArtworkPreview artwork={artwork} />{completed.includes(artwork.id) && <span className="library-card-restored"><Check size={12} />{t.restoredLabel}</span>}</span>
                  <span className="library-card-copy"><strong>{artwork.title[language]}</strong>{artwork.artist && <span className="artwork-credit">{artwork.artist}{artwork.year && ` · ${artwork.year}`}</span>}<span>{getEra(artwork.eraId).name[language]}</span>{hangingIds.has(artwork.id) && <small>{t.libraryOnWall}</small>}</span>
                </button>)}
              </div> : <p className="library-empty glass">{t.libraryEmpty}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
