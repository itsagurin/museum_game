import { test, expect } from '@playwright/test';
import { catalogPaintings, openCatalogStudio } from './helpers/catalog-coloring';

test('painting plays the selected local effects and stops them on undo and close', async ({ page }) => {
  await page.addInitScript(() => {
    const players: HTMLAudioElement[] = [];
    const calls: string[] = [];
    Reflect.set(window, 'paintingAudio', players);
    Reflect.set(window, 'paintingAudioCalls', calls);
    const NativeAudio = window.Audio;
    window.Audio = class extends NativeAudio {
      constructor(src?: string) { super(src); players.push(this); }
      play() { calls.push(this.src); return super.play(); }
    };
  });
  const entry = catalogPaintings[0];
  await openCatalogStudio(page, entry);
  await expect.poll(() => page.evaluate(() => (Reflect.get(window, 'paintingAudio') as HTMLAudioElement[])
    .filter(audio => audio.readyState >= 2).length)).toBe(5);
  const color = entry.painting.palette.find(candidate => entry.painting.grid.data.flat().filter(id => id === candidate.id).length > 5)!;
  const calls = () => page.evaluate(() => Reflect.get(window, 'paintingAudioCalls') as string[]);
  await page.getByRole('button', { name: `Kolor ${color.id}: ${color.name}`, exact: true }).click();
  await page.locator(`.pixel-hit:not([data-color-id="${color.id}"])`).first().press('Enter');
  expect(await calls()).toEqual([]);
  const matching = page.locator(`.pixel-hit[data-color-id="${color.id}"]:not(.painted)`);
  await matching.first().press('Enter');
  await expect.poll(() => page.evaluate(() => (Reflect.get(window, 'paintingAudio') as HTMLAudioElement[])
    .some(audio => audio.src.endsWith('message-pop-alert.mp3') && !audio.paused && audio.currentTime > 0))).toBe(true);
  await page.locator('.pixel-hit.painted').first().press('Enter');
  expect((await calls()).length).toBe(1);
  for (let i = 0; i < 4; i++) await matching.first().press('Enter');
  expect((await calls()).filter(src => src.endsWith('message-pop-alert.mp3'))).toHaveLength(5);
  expect((await calls()).filter(src => src.endsWith('light-spell.wav'))).toHaveLength(1);
  await expect.poll(() => page.evaluate(() => (Reflect.get(window, 'paintingAudio') as HTMLAudioElement[])
    .some(audio => audio.src.endsWith('light-spell.wav') && !audio.paused && audio.currentTime > 0))).toBe(true);
  await page.getByRole('button', { name: 'Cofnij', exact: true }).click();
  expect(await page.evaluate(() => (Reflect.get(window, 'paintingAudio') as HTMLAudioElement[])
    .filter(audio => audio.src.endsWith('light-spell.wav')).every(audio => audio.paused))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (Reflect.get(window, 'paintingAudio') as HTMLAudioElement[]).every(audio => audio.paused))).toBe(true);
});
