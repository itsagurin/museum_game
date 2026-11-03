export type ColoringSound = 'select' | 'correct' | 'wrong' | 'complete' | 'auto-fill' | 'cancel-auto-fill';
export const coloringSoundEvent = 'heritage:coloring-sound';
export function playColoringSound(kind: ColoringSound) {
  window.dispatchEvent(new CustomEvent(coloringSoundEvent, { detail: kind }));
}
