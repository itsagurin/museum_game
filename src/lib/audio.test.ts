import { describe, expect, it } from 'vitest';
import { audioTarget } from './audio';
describe('ambient audio policy', () => {
  it('never starts without consent and a user gesture', () => {
    expect(audioTarget(false, true, false, false)).toBe('off');
    expect(audioTarget(true, false, false, false)).toBe('off');
  });
  it('pauses while hidden and lowers volume while reading', () => {
    expect(audioTarget(true, true, true, false)).toBe('off');
    expect(audioTarget(true, true, false, true)).toBe('quiet');
    expect(audioTarget(true, true, false, false)).toBe('normal');
  });
});
