'use client';

import { useEffect } from 'react';
import { useIsPresent } from 'framer-motion';
import { coloringSoundEvent, type ColoringSound } from '@/lib/audio';

/** Only the two selected painting effects; scoped to the open studio. */
export function ColoringAudio() {
  const present = useIsPresent();
  useEffect(() => {
    if (!present) return;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const makeAudio = (file: string, volume: number) => {
      const audio = new Audio(`${basePath}/audio/${file}`);
      audio.preload = 'auto';
      audio.volume = volume;
      return audio;
    };
    // A bounded pool lets quick brush strokes overlap without creating players.
    const pops = Array.from({ length: 4 }, () => makeAudio('message-pop-alert.mp3', .35));
    const spell = makeAudio('light-spell.wav', .45);
    const players = [...pops, spell];
    let nextPop = 0;
    const stop = (audio: HTMLAudioElement) => {
      audio.pause();
      audio.currentTime = 0;
    };
    const play = (audio: HTMLAudioElement) => {
      try {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      } catch { /* Media restrictions must never interrupt painting. */ }
    };
    const feedback = (event: Event) => {
      const kind = (event as CustomEvent<ColoringSound>).detail;
      if (kind === 'cancel-auto-fill') { stop(spell); return; }
      if (document.hidden) return;
      if (kind === 'correct') play(pops[nextPop++ % pops.length]);
      if (kind === 'auto-fill') play(spell);
    };
    const visibility = () => { if (document.hidden) players.forEach(stop); };
    window.addEventListener(coloringSoundEvent, feedback);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener(coloringSoundEvent, feedback);
      document.removeEventListener('visibilitychange', visibility);
      players.forEach(audio => {
        stop(audio);
        audio.removeAttribute('src');
        audio.load();
      });
    };
  }, [present]);
  return null;
}
