"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ExternalLink, Sparkles, X } from "lucide-react";
import { assetUrl } from "@/data/eras";
import { getDecorationGeometry, getDecorationImageRegion, getRoomDecorations, roomDecorations, type RoomDecoration } from "@/data/room-decorations";
import type { EraId, Language } from "@/types/game";

const text = {
  pl: { close: "Zamknij ciekawostkę", why: "Dlaczego w tej epoce?", source: "Źródło", unlocked: "Nowe przedmioty w pokoju", level: "Poziom", inspect: "Poznaj przedmiot", dismiss: "Zamknij komunikat" },
  en: { close: "Close object story", why: "Why this era?", source: "Source", unlocked: "New objects in your room", level: "Level", inspect: "Discover object", dismiss: "Dismiss announcement" },
};
type Selection = { item: RoomDecoration; anchor: SVGPathElement; pinned: boolean };

function ObjectBubble({ selection, language, onClose, onEnter, onLeave }: {
  selection: Selection; language: Language; onClose: () => void; onEnter: () => void; onLeave: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const t = text[language], item = selection.item;
  useLayoutEffect(() => {
    const bubble = ref.current, root = selection.anchor.closest(".heritage-app");
    if (!bubble || !root) return;
    let frame = 0;
    const reposition = () => {
      const object = selection.anchor.getBoundingClientRect(), bounds = root.getBoundingClientRect();
      const header = root.querySelector(".site-header")?.getBoundingClientRect(), nav = root.querySelector(".era-switcher")?.getBoundingClientRect();
      const top = Math.max(bounds.top + 12, (header?.bottom ?? bounds.top) + 10), bottom = Math.min(bounds.bottom - 12, (nav?.top ?? bounds.bottom) - 10);
      bubble.style.maxHeight = `${Math.max(110, bottom - top)}px`;
      const width = bubble.offsetWidth, height = bubble.offsetHeight, center = object.left + object.width / 2;
      const left = Math.max(bounds.left + 12, Math.min(center - width / 2, bounds.right - width - 12));
      const above = object.top - height - 14 >= top, desired = above ? object.top - height - 14 : object.bottom + 14;
      bubble.style.left = `${left}px`; bubble.style.top = `${Math.max(top, Math.min(desired, bottom - height))}px`;
      bubble.style.setProperty("--bubble-arrow-x", `${Math.max(20, Math.min(center - left, width - 20))}px`);
      bubble.dataset.side = above ? "above" : "below";
      bubble.style.visibility = object.right > bounds.left && object.left < bounds.right && object.bottom > top && object.top < bottom ? "visible" : "hidden";
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(reposition); };
    const observer = new ResizeObserver(schedule); observer.observe(bubble); observer.observe(root);
    window.addEventListener("resize", schedule); document.addEventListener("scroll", schedule, true); document.addEventListener("fullscreenchange", schedule);
    reposition();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("resize", schedule); document.removeEventListener("scroll", schedule, true); document.removeEventListener("fullscreenchange", schedule); };
  }, [selection.anchor, language]);
  return createPortal(
    <div ref={ref} id="room-object-story" className="decoration-bubble glass" role="dialog" aria-modal="false" aria-labelledby="room-object-title" onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <div className="decoration-bubble-content">
      <div className="decoration-bubble-top"><span><Sparkles size={12} />{t.level} {item.level}</span><button className="icon-button" onClick={onClose} aria-label={t.close}><X size={16} /></button></div>
      <h2 id="room-object-title">{item.name[language]}</h2>
      <p>{item.fact[language]}</p><h3>{t.why}</h3><p>{item.reason[language]}</p>
      <a href={item.source.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.source}: ${item.source.title}`}>{t.source}<ExternalLink size={12} /></a>
      </div>
    </div>, selection.anchor.closest(".heritage-app") ?? document.body,
  );
}

export function RoomDecorations({ eraId, level, language, gentle, active, pendingIds, onRewardsShown }: {
  eraId: EraId; level: number; language: Language; gentle: boolean; active: boolean;
  pendingIds: string[]; onRewardsShown: (ids: string[]) => void;
}) {
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const captureRoot = useCallback((node: HTMLDivElement | null) => { if (node) setPortalTarget(node.closest(".heritage-app")); }, []);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [toastIds, setToastIds] = useState<string[] | null>(null);
  const [loadedIds, setLoadedIds] = useState<Set<string>>(() => new Set());
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerFocus = useRef(false);
  const objects = getRoomDecorations(eraId, level), t = text[language], pendingKey = pendingIds.join("|");
  const pendingReady = pendingIds.every((id) => loadedIds.has(id));
  const markLoaded = (id: string) => setLoadedIds((current) => current.has(id) ? current : new Set([...current, id]));
  const keepOpen = useCallback(() => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);
  const close = useCallback(() => { keepOpen(); setSelection(null); }, [keepOpen]);
  const leave = () => { if (selection?.pinned) return; keepOpen(); leaveTimer.current = setTimeout(() => setSelection(null), 220); };
  useEffect(() => () => keepOpen(), [keepOpen]);
  useEffect(() => {
    if (!selection) return;
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); selection.anchor.focus({ preventScroll: true }); close(); } };
    const outside = (event: PointerEvent) => { if (event.target instanceof Element && !event.target.closest(".decoration-bubble") && event.target !== selection.anchor) close(); };
    document.addEventListener("keydown", key); document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("pointerdown", outside); };
  }, [selection, close]);
  useEffect(() => {
    if (!active || !pendingKey || !pendingReady) return;
    const ids = pendingKey.split("|");
    const reveal = setTimeout(() => setToastIds(ids), 20), consume = setTimeout(() => onRewardsShown(ids), gentle ? 250 : 1600);
    return () => { clearTimeout(reveal); clearTimeout(consume); };
  }, [active, pendingKey, pendingReady, onRewardsShown, gentle]);
  useEffect(() => { if (!toastIds) return; const timeout = setTimeout(() => setToastIds(null), 6500); return () => clearTimeout(timeout); }, [toastIds]);

  const visibleSelection = active && selection && objects.some(({ id }) => id === selection.item.id) ? selection : null;
  return <>
    <div ref={captureRoot} className="room-decorations" data-era={eraId}>
      {objects.map((item, index) => {
        const geometry = getDecorationGeometry(item), region = getDecorationImageRegion(item);
        const pending = pendingIds.includes(item.id), revealed = active && loadedIds.has(item.id);
        const highlighted = Boolean(visibleSelection && (visibleSelection.item.id === item.id || item.supportId === visibleSelection.item.id));
        return <div key={item.id} className={`room-decoration ${highlighted ? "is-highlighted" : ""} ${pending && revealed ? "is-unlocking" : ""}`} data-decoration-id={item.id} data-level={item.level}
          style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.width}%`, height: `${region.height}%`, zIndex: item.layer, "--unlock-delay": `${gentle ? 0 : (index % 3) * 90}ms` } as CSSProperties}>
          <motion.div className="decoration-visual" initial={pending ? { opacity: 0, y: gentle ? 0 : 18 } : false}
            animate={{ opacity: pending && !revealed ? 0 : 1, y: pending && !revealed && !gentle ? 18 : highlighted && !gentle ? -4 : 0 }}
            transition={{ duration: gentle ? 0 : pending ? 0.7 : 0.18, delay: pending && active && !gentle ? (index % 3) * 0.09 : 0 }}>
            {/* Preserve the source PNG's alpha and coordinate system in the static export. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assetUrl(item.image)} alt="" draggable={false} decoding="async" onLoad={() => markLoaded(item.id)} onError={(event) => { event.currentTarget.hidden = true; markLoaded(item.id); }} />
          </motion.div>
          <svg className="decoration-hit-map" viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-hidden={!active}>
            <path d={geometry.hitPath} className="decoration-hit" role="button" tabIndex={active ? 0 : -1} aria-label={`${t.inspect}: ${item.name[language]}`} aria-expanded={visibleSelection?.item.id === item.id} aria-controls={visibleSelection?.item.id === item.id ? "room-object-story" : undefined}
              style={{ pointerEvents: active ? "fill" : "none" }}
              onPointerEnter={(event) => { if (event.pointerType === "mouse" && !event.buttons && active) { keepOpen(); if (!selection?.pinned) setSelection({ item, anchor: event.currentTarget, pinned: false }); } }}
              onPointerLeave={leave}
              onPointerDown={() => { pointerFocus.current = true; }}
              onFocus={(event) => { if (active && !pointerFocus.current) { keepOpen(); setSelection({ item, anchor: event.currentTarget, pinned: true }); } }}
              onBlur={(event) => { pointerFocus.current = false; if (!(event.relatedTarget instanceof Element) || !event.relatedTarget.closest(".decoration-bubble")) close(); }}
              onClick={(event) => { pointerFocus.current = false; if (!active) return; keepOpen(); const anchor = event.currentTarget; setSelection((current) => current?.item.id === item.id && current.pinned ? null : { item, anchor, pinned: true }); }}
              onKeyDown={(event) => { pointerFocus.current = false; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); keepOpen(); setSelection({ item, anchor: event.currentTarget, pinned: true }); } }} />
          </svg>
        </div>;
      })}
    </div>
    {visibleSelection && <ObjectBubble key={visibleSelection.item.id} selection={visibleSelection} language={language} onClose={close} onEnter={keepOpen} onLeave={leave} />}
    {active && toastIds && portalTarget && createPortal(<motion.div className="decoration-unlock-toast glass" role="status" initial={{ opacity: 0, y: gentle ? 0 : -10 }} animate={{ opacity: 1, y: 0 }}>
      <Sparkles size={19} /><div><strong>{t.unlocked}</strong><span>{roomDecorations.filter(({ id }) => toastIds.includes(id)).map((item) => item.name[language]).join(" · ")}</span></div><button className="icon-button" aria-label={t.dismiss} onClick={() => setToastIds(null)}><X size={15} /></button>
    </motion.div>, portalTarget)}
  </>;
}
