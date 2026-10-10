import { describe, it, expect } from 'vitest';
import { completeChapter, initialProgress, chapterStatus, parseProgress, readProgress, saveProgress, resetProgress } from './progress';

describe('chapter progression', () => {
  it('unlocks only the first chapter initially', () => {
    expect(chapterStatus(initialProgress(), 'stanczyk')).toBe('available');
    expect(chapterStatus(initialProgress(), 'bociany')).toBe('locked');
  });
  it('rejects out-of-order and unknown completions', () => {
    expect(completeChapter(initialProgress(), 'konstytucja').completed).toEqual([]);
    expect(completeChapter(initialProgress(), 'unknown').completed).toEqual([]);
  });
  it('completes once and unlocks the next chapter', () => {
    const state = completeChapter(initialProgress(), 'stanczyk');
    expect(state.completed).toEqual(['stanczyk']);
    expect(chapterStatus(state, 'bociany')).toBe('available');
    expect(chapterStatus(state, 'stanczyk')).toBe('completed');
    expect(completeChapter(state, 'stanczyk').completed).toEqual(['stanczyk']);
  });
  it('allows the whole ordered journey and resets it', () => {
    const state = ['stanczyk', 'bociany', 'konstytucja'].reduce(completeChapter, initialProgress());
    expect(state.completed).toEqual(['stanczyk', 'bociany', 'konstytucja']);
    expect(resetProgress({ ...state, soundEnabled: true }).completed).toEqual([]);
    expect(resetProgress(state).hasSeenIntroduction).toBe(false);
  });
});

describe('resilient local progress', () => {
  it('recovers from broken JSON, unsupported version and wrong field types', () => {
    for (const raw of ['{', 'null', '{"version":2}', '{"version":1,"completed":"oops"}']) {
      expect(parseProgress(raw)).toEqual(initialProgress());
    }
  });
  it('accepts only contiguous known completed chapters and boolean preferences', () => {
    const raw = JSON.stringify({ version: 1, completed: ['bociany', 'garbage'], soundEnabled: 'yes', hasSeenIntroduction: true });
    expect(parseProgress(raw)).toEqual({ ...initialProgress(), hasSeenIntroduction: true });
    expect(parseProgress(JSON.stringify({ version: 1, completed: ['stanczyk', 'stanczyk', 'bociany'] })).completed).toEqual(['stanczyk', 'bociany']);
  });
  it('continues when storage access fails', () => {
    const storage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } };
    expect(readProgress(storage)).toEqual(initialProgress());
    expect(saveProgress(storage, initialProgress())).toBe(false);
  });
  it('round-trips a completed chapter and settings through storage', () => {
    const data = new Map<string, string>();
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
    const progress = { ...completeChapter(initialProgress(), 'stanczyk'), soundEnabled: true, reducedMotion: true, hasSeenIntroduction: true };
    expect(saveProgress(storage, progress)).toBe(true);
    expect(readProgress(storage)).toEqual(progress);
  });
});
