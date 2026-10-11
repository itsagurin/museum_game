'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, Eye, Grid, Hand, Paintbrush, PaintBucket, RotateCcw, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { paintResult, type ColoringArtwork } from '@/lib/coloring';
import { playColoringSound } from '@/lib/audio';
import { useProgress } from '@/store/use-progress';
import { coloringCopy } from '@/data/coloring-copy';
import type { Language } from '@/types/game';

type Origin = { x: number; y: number };
type Pixel = { id: number; colorId: number; x: number; y: number };
type Feedback = { key: number; kind: 'correct' | 'wrong'; pixel: Pixel };

export function ColoringCanvas({ artwork, onComplete, language = 'pl', gentleMotion, showColorNumbers = false, allowDevColorFill = false }: {
  artwork: ColoringArtwork;
  onComplete: () => void;
  language?: Language;
  gentleMotion?: boolean;
  showColorNumbers?: boolean;
  allowDevColorFill?: boolean;
}) {
  const t = coloringCopy[language];
  const pixels = useMemo(() => artwork.grid.data.flatMap((row, y) => row.map((colorId, x) => ({ id: y * artwork.grid.width + x, colorId, x, y }))), [artwork]);
  const colors = useMemo(() => new Map(artwork.palette.map(color => [color.id, color])), [artwork]);
  const colorLabel = (id: number) => `${showColorNumbers ? `${id} · ` : ''}${colors.get(id)!.name}`;
  const [selected, setSelected] = useState<number | null>(null);
  const [painted, setPainted] = useState<Map<number, Origin>>(new Map());
  const [settled, setSettled] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panning, setPanning] = useState(false);
  const [devColorFill, setDevColorFill] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [mode, setMode] = useState<'original' | 'pixels'>('original');
  const [imageFailed, setImageFailed] = useState(false);
  const dragging = useRef(false);
  const lastPixel = useRef<number | null>(null);
  const paintedRef = useRef(painted);
  const paintActions = useRef<number[][]>([]);
  const feedbackKey = useRef(0);
  const systemReduced = useReducedMotion();
  const prototypeReduced = useProgress(state => state.progress.reducedMotion);
  const reduced = (gentleMotion ?? prototypeReduced) || systemReduced;
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = artwork.grid;
  const ready = pixels.every(pixel => painted.has(pixel.id) && settled.has(pixel.id));

  // Preload original image for instantaneous, zero-jank reveal transition
  useEffect(() => {
    if (!artwork.original_image_url) return;
    const img = new Image();
    img.src = artwork.original_image_url;
  }, [artwork.original_image_url]);

  // When all pixels are painted, wait a fraction of a second, then play animation and reveal the original
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      setRevealed(true);
      setZoom(1);
      setPanning(false);
      playColoringSound('complete');
    }, reduced ? 40 : 420);
    return () => {
      window.clearTimeout(timer);
      setRevealed(false);
    };
  }, [ready, reduced]);

  const paint = (pixel: Pixel) => {
    if (ready) return;
    const result = paintResult(pixel.colorId, selected, !devColorFill && paintedRef.current.has(pixel.id));
    if (result === 'ignored') return;
    const targets = result === 'correct'
      ? devColorFill
        ? pixels.filter(candidate => candidate.colorId === pixel.colorId && !paintedRef.current.has(candidate.id))
        : [pixel]
      : [];
    if (result === 'correct' && !targets.length) return;
    setFeedback({ key: ++feedbackKey.current, kind: result, pixel });
    playColoringSound(result);
    if (result === 'correct') {
      const next = new Map(paintedRef.current);
      for (const target of targets) next.set(target.id, { x: target.x + .5, y: target.y + .5 });
      paintActions.current.push(targets.map(target => target.id));
      paintedRef.current = next;
      setPainted(next);
    }
  };
  const paintAt = (clientX: number, clientY: number) => {
    if (ready) return;
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = Math.floor((clientX - bounds.left) / bounds.width * width);
    const y = Math.floor((clientY - bounds.top) / bounds.height * height);
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const pixel = pixels[y * width + x];
    if (lastPixel.current === pixel.id) return;
    const previous = lastPixel.current === null ? pixel : pixels[lastPixel.current];
    lastPixel.current = pixel.id;
    const steps = Math.max(Math.abs(pixel.x - previous.x), Math.abs(pixel.y - previous.y));
    if (!steps) { paint(pixel); return; }
    for (let step = 1; step <= steps; step++) {
      const px = Math.round(previous.x + (pixel.x - previous.x) * step / steps);
      const py = Math.round(previous.y + (pixel.y - previous.y) * step / steps);
      paint(pixels[py * width + px]);
    }
  };
  const undo = () => {
    const last = paintActions.current.pop();
    if (!last) return;
    const next = new Map(paintedRef.current);
    for (const id of last) next.delete(id);
    paintedRef.current = next; setPainted(next);
    setSettled(previous => { const next = new Set(previous); for (const id of last) next.delete(id); return next; });
    setFeedback(null);
    setRevealed(false);
  };
  const message = revealed
    ? mode === 'original'
      ? t.originalDescription(artwork.title, artwork.artist, artwork.year)
      : t.pixelsDescription
    : panning
    ? t.panInstruction
    : ready
    ? t.ready
    : feedback?.kind === 'wrong'
    ? t.wrong(colorLabel(feedback.pixel.colorId))
    : selected !== null
    ? devColorFill ? t.devSelected(colorLabel(selected)) : t.selected(colorLabel(selected))
    : t.instruction;

  return <div className="coloring-workspace numbered-workspace">
    <div className={`sr-only coloring-instruction ${feedback?.kind === 'wrong' ? 'is-wrong' : ''}`} role="status" aria-live="polite"><Paintbrush size={15} aria-hidden /><span>{message}</span></div>

    {revealed && (
      <div className="revealed-banner" role="region" aria-label={t.restored}>
        <div className="revealed-badge">
          <Sparkles size={14} aria-hidden />
          <span>{t.restoredBadge}</span>
        </div>
        <div className="revealed-switch" role="group" aria-label={t.view}>
          <button
            type="button"
            className={`switch-tab ${mode === 'original' ? 'is-active' : ''}`}
            onClick={() => setMode('original')}
            aria-pressed={mode === 'original'}
          >
            <Eye size={12} aria-hidden style={{ display: 'inline', marginRight: 4 }} />
            {t.original}
          </button>
          <button
            type="button"
            className={`switch-tab ${mode === 'pixels' ? 'is-active' : ''}`}
            onClick={() => setMode('pixels')}
            aria-pressed={mode === 'pixels'}
          >
            <Grid size={12} aria-hidden style={{ display: 'inline', marginRight: 4 }} />
            {t.pixels}
          </button>
        </div>
      </div>
    )}

    <div className={`coloring-frame numbered-frame ${ready ? 'is-complete' : ''} ${revealed ? 'is-revealed' : ''}`}>
      <div className="coloring-viewport" style={{ aspectRatio: `${width}/${height}` }}>
        <svg ref={svgRef} className={`coloring-canvas pixel-canvas ${panning ? 'is-panning' : ''}`} viewBox={`0 0 ${width} ${height}`} aria-label={`${t.canvas}: ${artwork.title}`} style={{ aspectRatio: `${width}/${height}`, width: `${zoom * 100}%`, minWidth: `${zoom * 100}%`, maxWidth: 'none' }}
          onPointerDown={event => { if (event.button !== 0 || panning) return; dragging.current = true; lastPixel.current = null; event.currentTarget.setPointerCapture(event.pointerId); paintAt(event.clientX, event.clientY); }}
          onPointerMove={event => { if (dragging.current) paintAt(event.clientX, event.clientY); }}
          onPointerUp={() => { dragging.current = false; lastPixel.current = null; }}
          onPointerCancel={() => { dragging.current = false; lastPixel.current = null; }}
          onLostPointerCapture={() => { dragging.current = false; lastPixel.current = null; }}>
          <rect width={width} height={height} fill="#f3eddf" />
          {pixels.map(pixel => {
            const color = colors.get(pixel.colorId)!;
            const filled = painted.has(pixel.id), matching = selected === pixel.colorId;
            return <g key={pixel.id}>
              <rect x={pixel.x} y={pixel.y} width="1" height="1" fill={color.hex} opacity={filled ? 1 : matching ? .48 : .2} shapeRendering="crispEdges" />
              {filled && <motion.rect x={pixel.x} y={pixel.y} width="1" height="1" fill="#fff6da" pointerEvents="none" initial={{ opacity: .65 }} animate={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .35 }} onAnimationComplete={() => setSettled(previous => previous.has(pixel.id) ? previous : new Set(previous).add(pixel.id))} />}
              <rect x={pixel.x} y={pixel.y} width="1" height="1" className={`pixel-hit ${matching ? 'matching' : ''} ${filled ? 'painted' : ''}`} role="button" tabIndex={filled ? -1 : 0} aria-pressed={filled} aria-label={`${t.pixel} ${pixel.x + 1}, ${pixel.y + 1}: ${color.name}${filled ? ` — ${t.painted}` : ''}`} data-color-id={pixel.colorId} fill="transparent" stroke="#fff8e9" strokeOpacity={filled ? .05 : .35} strokeWidth=".035"
                onClick={event => { if (event.detail === 0) paint(pixel); }}
                onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); paint(pixel); } }} />
            </g>;
          })}
          <AnimatePresence>
            {feedback && <motion.rect key={feedback.key} x={feedback.pixel.x} y={feedback.pixel.y} width="1" height="1" pointerEvents="none" fill={feedback.kind === 'wrong' ? '#d15e4c' : '#fff6da'} stroke={feedback.kind === 'wrong' ? '#ac3d30' : '#edd6a3'} strokeWidth=".12" initial={{ opacity: .8 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? .15 : .5 }} />}
          </AnimatePresence>
        </svg>

        <AnimatePresence>
          {revealed && !imageFailed && (
            <motion.div
              className="revealed-overlay"
              style={{ pointerEvents: mode === 'original' ? 'auto' : 'none' }}
              initial={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
              animate={{ opacity: mode === 'original' ? 1 : 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: reduced ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork.original_image_url}
                alt={artwork.title}
                className="revealed-image"
                onError={() => setImageFailed(true)}
              />
              <div className="revealed-shimmer" aria-hidden />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
    {revealed && imageFailed && <p className="reproduction-notice" role="status">{t.unavailable}</p>}
    <div className="painting-tools"><div><button className="text-button" aria-label={zoom === 1 ? t.zoomIn : t.zoomOut} onClick={() => { setZoom(previous => previous === 1 ? Math.max(2.5, width * 24 / 320) : 1); setPanning(false); }}>{zoom === 1 ? <ZoomIn size={17} aria-hidden /> : <ZoomOut size={17} aria-hidden />}</button><button className="text-button" aria-label={t.pan} aria-pressed={panning} disabled={zoom === 1} onClick={() => setPanning(previous => !previous)}><Hand size={17} aria-hidden /></button>{allowDevColorFill && <button type="button" className="text-button dev-color-fill" aria-label={t.devColorFill} title={t.devColorFill} aria-pressed={devColorFill} onClick={() => { setDevColorFill(previous => !previous); setFeedback(null); }}><PaintBucket size={16} aria-hidden /><span>DEV</span></button>}<button className="text-button coloring-undo" disabled={!painted.size} onClick={undo}><RotateCcw size={14} aria-hidden />{t.undo}</button></div></div>
    <div className="numbered-palette" style={{ gridTemplateColumns: `repeat(${Math.min(artwork.palette.length, 6)}, minmax(0, 1fr))` }} role="group" aria-label={t.chooseColor}>{artwork.palette.map(color => {
      const fields = pixels.filter(pixel => pixel.colorId === color.id), filled = fields.filter(pixel => painted.has(pixel.id)).length;
      const done = fields.length > 0 && fields.length === filled;
      return <button key={color.id} className={`paint-brush ${selected === color.id ? 'selected' : ''} ${done ? 'complete' : ''}`} aria-label={`${t.color}${showColorNumbers ? ` ${color.id}` : ''}: ${color.name}`} title={color.name} aria-pressed={selected === color.id} data-color-id={color.id} onClick={() => { setSelected(color.id); setPanning(false); setFeedback(null); playColoringSound('select'); }}>
        <span className="brush-swatch" style={{ backgroundColor: color.hex, color: [1, 3, 5].reduce((sum, offset) => sum + parseInt(color.hex.slice(offset, offset + 2), 16), 0) > 400 ? '#393225' : '#fff5e6' }}>{showColorNumbers ? <span className="brush-number">{color.id}</span> : selected === color.id && <Check size={16} aria-hidden />}</span><span className="brush-shape"><Paintbrush size={18} aria-hidden /></span><span className="brush-count sr-only">{done ? <Check size={12} aria-hidden /> : `${filled}/${fields.length}`}</span>
      </button>;
    })}</div>
    <div className="coloring-progress"><div className="coloring-progress-track"><span style={{ transform: `scaleX(${painted.size / pixels.length})` }} /></div><span className="sr-only" role="status" aria-live="polite">{t.progress}: {painted.size} / {pixels.length}</span></div>
    <div className="coloring-footer"><button className={`primary-button ${revealed ? 'is-revealed' : ''}`} disabled={!ready} onClick={onComplete}>{ready ? t.discover : t.finish}<ArrowUpRight size={17} aria-hidden /></button></div>
  </div>;
}
