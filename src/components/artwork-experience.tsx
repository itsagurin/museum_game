'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { artworks } from '@/data/artworks';
import type { ChapterId } from '@/lib/progress';
import { parseColoringArtwork, type ColoringArtwork } from '@/lib/coloring';
import { ColoringCanvas } from './coloring-canvas';

const focusHeading = (node: HTMLHeadingElement | null) => { node?.focus({ preventScroll: true }); };

export interface ArtworkExperienceProps { artworkId: ChapterId; onComplete: () => void; onExit: () => void; data?: unknown }
export function ArtworkExperience({ artworkId, onComplete, onExit, data }: ArtworkExperienceProps) {
  const artwork = artworks.find((item) => item.id === artworkId)!;
  const [payload, setPayload] = useState<ColoringArtwork | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const value = await Promise.resolve(data ?? fetch(`/artworks/${artworkId}.json`, { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('load'); return response.json(); }));
        if (!controller.signal.aborted) setPayload(parseColoringArtwork(value));
      } catch { if (!controller.signal.aborted) setError(true); }
    };
    void load();
    return () => controller.abort();
  }, [artworkId, data, attempt]);
  return <motion.section className="artwork-experience coloring-experience" aria-label={`Pracownia: ${payload?.title ?? artwork.title}`} initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
    <button className="text-button artwork-back" onClick={onExit}><ArrowLeft size={16} aria-hidden />Wróć do domu</button>
    <div className="artwork-heading"><h1 ref={focusHeading} tabIndex={-1}>{payload?.title ?? artwork.title}</h1></div>
    {payload ? <ColoringCanvas key={payload.id} artwork={payload} onComplete={onComplete} /> : <div className="coloring-loading" role="status"><Sparkles size={25} strokeWidth={1} aria-hidden /><p>{error ? 'Nie udało się przygotować obrazu.' : 'Przygotowujemy Twoje płótno…'}</p>{error && <button className="text-button" onClick={() => { setError(false); setAttempt(previous => previous + 1); }}>Spróbuj ponownie</button>}</div>}
  </motion.section>;
}
