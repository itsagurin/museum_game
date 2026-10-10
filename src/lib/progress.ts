export const chapterIds = ['stanczyk', 'bociany', 'konstytucja'] as const;
export type ChapterId = (typeof chapterIds)[number];
export type ChapterStatus = 'locked' | 'available' | 'completed';
export interface Progress {
  version: 1;
  completed: ChapterId[];
  hasSeenIntroduction: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
}
export const storageKey = 'dom-opowiesci:v1';
export const initialProgress = (): Progress => ({ version: 1, completed: [], hasSeenIntroduction: false, soundEnabled: false, reducedMotion: false });
export function chapterStatus(progress: Progress, id: string): ChapterStatus {
  const index = chapterIds.indexOf(id as ChapterId);
  if (index < 0) return 'locked';
  if (progress.completed.includes(id as ChapterId)) return 'completed';
  return index === progress.completed.length ? 'available' : 'locked';
}
export function completeChapter(progress: Progress, id: string): Progress {
  return chapterStatus(progress, id) === 'available' ? { ...progress, completed: [...progress.completed, id as ChapterId] } : progress;
}
export function resetProgress(progress: Progress): Progress {
  return { ...initialProgress(), soundEnabled: progress.soundEnabled, reducedMotion: progress.reducedMotion };
}
export function parseProgress(raw: string | null): Progress {
  const defaults = initialProgress();
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('completed' in value) || !Array.isArray(value.completed)) return defaults;
    const candidate = value as Record<string, unknown>;
    for (const id of chapterIds) {
      if (!(candidate.completed as unknown[]).includes(id)) break;
      defaults.completed.push(id);
    }
    for (const key of ['hasSeenIntroduction', 'soundEnabled', 'reducedMotion'] as const) {
      if (typeof candidate[key] === 'boolean') defaults[key] = candidate[key];
    }
    return defaults;
  } catch { return defaults; }
}
type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;
export function readProgress(storage: StorageAdapter): Progress {
  try { return parseProgress(storage.getItem(storageKey)); } catch { return initialProgress(); }
}
export function saveProgress(storage: StorageAdapter, progress: Progress): boolean {
  try { storage.setItem(storageKey, JSON.stringify(progress)); return true; } catch { return false; }
}
