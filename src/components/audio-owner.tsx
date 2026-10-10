'use client';
import { useEffect, useRef, useState } from 'react';
import { AmbientSound, audioTarget, coloringSoundEvent, type ColoringSound } from '@/lib/audio';

export function AudioOwner({ enabled, reading, completed }: { enabled: boolean; reading: boolean; completed: number }) {
  const engine = useRef<AmbientSound | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const previousCount = useRef(completed);
  const settings = useRef({ enabled, reading, unlocked });
  useEffect(() => { settings.current = { enabled, reading, unlocked }; }, [enabled, reading, unlocked]);
  useEffect(() => {
    const interact = () => {
      setUnlocked(true);
      if (engine.current && settings.current.enabled && !document.hidden) {
        void engine.current.update(settings.current.reading ? 'quiet' : 'normal').catch(() => {});
      }
    };
    document.addEventListener('pointerdown', interact);
    document.addEventListener('keydown', interact);
    const visibility = () => {
      const current = settings.current;
      void engine.current?.update(audioTarget(current.enabled, current.unlocked, document.hidden, current.reading)).catch(() => {});
    };
    document.addEventListener('visibilitychange', visibility);
    const feedback = (event: Event) => {
      const kind = (event as CustomEvent<ColoringSound>).detail;
      if (!settings.current.enabled || !settings.current.unlocked || document.hidden || !['select', 'correct', 'wrong', 'complete'].includes(kind)) return;
      try { engine.current?.feedback(kind); } catch { /* Optional effects never block painting. */ }
    };
    window.addEventListener(coloringSoundEvent, feedback);
    return () => {
      document.removeEventListener('pointerdown', interact); document.removeEventListener('keydown', interact); document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener(coloringSoundEvent, feedback);
      void engine.current?.dispose().catch(() => {}); engine.current = null;
    };
  }, []);
  useEffect(() => {
    if (!enabled || !unlocked) { void engine.current?.update('off').catch(() => {}); return; }
    try {
      if (!engine.current) engine.current = new AmbientSound();
      void engine.current.update(audioTarget(enabled, unlocked, document.hidden, reading)).catch(() => {});
    } catch { /* Audio is optional; an unavailable AudioContext never blocks the story. */ }
  }, [enabled, unlocked, reading]);
  useEffect(() => {
    if (completed > previousCount.current && enabled) engine.current?.chime();
    previousCount.current = completed;
  }, [completed, enabled]);
  return null;
}
