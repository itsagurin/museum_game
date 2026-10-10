'use client';
import { create } from 'zustand';
import { completeChapter, initialProgress, parseProgress, resetProgress, saveProgress, storageKey, type Progress } from '@/lib/progress';

interface ProgressStore {
  progress: Progress;
  hydrated: boolean;
  storageAvailable: boolean;
  hydrate: () => void;
  complete: (id: string) => void;
  setPreference: (key: 'soundEnabled' | 'reducedMotion' | 'hasSeenIntroduction', value: boolean) => void;
  reset: () => void;
}
export const useProgress = create<ProgressStore>((set, get) => {
  const persist = (progress: Progress) => {
    let storageAvailable = false;
    try { storageAvailable = saveProgress(window.localStorage, progress); } catch { /* Session-only progress is safe. */ }
    set({ progress, storageAvailable });
  };
  return {
    progress: initialProgress(), hydrated: false, storageAvailable: true,
    hydrate: () => {
      try { set({ progress: parseProgress(window.localStorage.getItem(storageKey)), hydrated: true }); }
      catch { set({ hydrated: true, storageAvailable: false }); }
    },
    complete: (id) => persist(completeChapter(get().progress, id)),
    setPreference: (key, value) => persist({ ...get().progress, [key]: value }),
    reset: () => persist(resetProgress(get().progress)),
  };
});
