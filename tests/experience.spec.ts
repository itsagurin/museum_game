import { test, expect, type Page } from '@playwright/test';

async function enter(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Wejdź do domu|Wróć do domu/ }).click();
  const skip = page.getByRole('button', { name: 'Pomiń' });
  await expect(skip).toBeVisible();
  await skip.click();
}

async function finishPainting(page: Page) {
  const canvas = page.getByLabel(/^Kolorowanie:/);
  await expect(canvas).toBeVisible();
  const brushes = page.getByRole('group', { name: 'Wybierz kolor' }).getByRole('button');
  for (const brush of await brushes.all()) {
    await brush.click();
    await page.locator('.pixel-hit.matching:not(.painted)').evaluateAll(elements => {
      for (const element of elements) element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
  }
  const discover = page.getByRole('button', { name: 'Odkryj opowieść', exact: true });
  await expect(discover).toBeEnabled();
  await discover.click();
}

test('three stories unlock in order, persist, replay without duplicate rewards, and reset', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await enter(page);
  await expect(page.getByText('Odkryte historie: 0/3')).toBeVisible();
  await page.getByRole('button', { name: /Bociany.*Zamknięta/ }).click({ force: true });
  await expect(page.getByText('Najpierw odkryj poprzednią opowieść.')).toBeVisible();
  const titles = ['Stańczyk', 'Bociany', 'Konstytucja 3 maja'];
  for (const [index, title] of titles.entries()) {
    await page.getByRole('button', { name: new RegExp(title + '.*Dostępna') }).click();
    await finishPainting(page);
    await expect(page.getByRole('dialog').getByRole('heading', { name: title, exact: true })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Wróć do domu', exact: true }).click();
    if (index === 2) {
      await expect(page.getByText('Dzięki Tobie ten dom znów żyje.')).toBeVisible();
      await page.getByRole('button', { name: 'Zostań jeszcze chwilę' }).click();
    }
    await expect(page.getByText(`Odkryte historie: ${index + 1}/3`)).toBeVisible();
  }
  await page.getByRole('button', { name: /Stańczyk.*Odkryta/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Wróć do domu', exact: true }).click();
  await expect(page.getByText('Odkryte historie: 3/3')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Wróć do domu' }).click();
  await expect(page.getByText('Odkryte historie: 3/3')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pomiń' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Ustawienia' }).click();
  await page.getByRole('button', { name: 'Rozpocznij od nowa' }).click();
  await page.getByRole('button', { name: 'Tak, zacznij od nowa' }).click();
  await expect(page.getByRole('button', { name: 'Wejdź do domu' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('settings trap keyboard focus, close with Escape, and persist motion preference', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Ustawienia' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.getByRole('switch', { name: 'Ogranicz animacje' }).click();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.reload();
  await trigger.click();
  await expect(page.getByRole('switch', { name: 'Ogranicz animacje' })).toBeChecked();
});

test('keyboard screen transitions announce the incoming heading', async ({ page }) => {
  await enter(page);
  const painting = page.getByRole('button', { name: /Stańczyk.*Dostępna/ });
  await painting.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Stańczyk', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Wróć do domu', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tutaj budzą się opowieści.' })).toBeFocused();
});

test('a failed exterior does not hide a healthy interior', async ({ page }) => {
  await enter(page);
  await page.route('**/assets/exterior*.webp', route => route.abort());
  await page.getByRole('button', { name: 'Dom Opowieści — ekran powitalny' }).click();
  await expect(page.locator('.scene')).toHaveClass(/scene-fallback/);
  await page.getByRole('button', { name: 'Wróć do domu', exact: true }).click();
  await expect(page.locator('.scene.inside')).not.toHaveClass(/scene-fallback/);
  await expect(page.locator('.scene-picture')).toBeVisible();
});

test('small and large screens fit without horizontal scrolling', async ({ page }) => {
  for (const [width, height] of [[360, 800], [390, 844], [768, 1024], [1440, 900], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Wejdź do domu' })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('system reduced motion hydrates without console errors and mobile story uses full width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await enter(page);
  await page.getByRole('button', { name: /Stańczyk.*Dostępna/ }).click();
  await finishPainting(page);
  const box = await page.getByRole('dialog').boundingBox();
  expect(box?.width).toBe(390);
  expect(errors).toEqual([]);
});

test('blocked storage and missing scene images do not prevent discovery', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('storage blocked'); } }); });
  await page.route('**/assets/*.webp', route => route.abort());
  await enter(page);
  await page.getByRole('button', { name: /Stańczyk.*Dostępna/ }).click();
  await finishPainting(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Wróć do domu' }).click();
  await expect(page.getByText('Odkryte historie: 1/3')).toBeVisible();
  await page.getByRole('button', { name: 'Ustawienia' }).click();
  await expect(page.getByText('Przeglądarka nie pozwala zapisać postępu. Możesz kontynuować w tej sesji.')).toBeVisible();
});

test('real ambient audio requires consent and a gesture, mutes and restores preferences', async ({ page }) => {
  await page.addInitScript(() => {
    const tracked = window as typeof window & { audioContexts: AudioContext[] };
    tracked.audioContexts = [];
    window.AudioContext = new Proxy(window.AudioContext, { construct(Target, args) {
      const context = Reflect.construct(Target, args) as AudioContext;
      tracked.audioContexts.push(context);
      return context;
    } });
  });
  await page.goto('/');
  const count = () => page.evaluate(() => (window as typeof window & { audioContexts: AudioContext[] }).audioContexts.length);
  const state = () => page.evaluate(() => (window as typeof window & { audioContexts: AudioContext[] }).audioContexts[0]?.state);
  expect(await count()).toBe(0);
  await page.getByRole('button', { name: 'Włącz dźwięk' }).click();
  await expect.poll(state).toBe('running');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Wyłącz dźwięk' })).toBeVisible();
  expect(await count()).toBe(0);
  await page.getByRole('button', { name: 'Wejdź do domu' }).click();
  await expect.poll(state).toBe('running');
  await page.getByRole('button', { name: 'Pomiń' }).click();
  await page.getByRole('button', { name: 'Wyłącz dźwięk' }).click();
  await expect.poll(state).toBe('suspended');
  expect(await count()).toBe(1);
});

test('tap paints only one pixel, duplicate taps do not count, and undo restores it', async ({ page, isMobile }) => {
  await enter(page);
  await page.getByRole('button', { name: /Stańczyk.*Dostępna/ }).click();
  await expect(page.getByRole('button', { name: 'Dokończ swoje płótno' })).toBeDisabled();
  const field = page.getByLabel(/^Kolorowanie:/).getByRole('button').first();
  const color = (await field.getAttribute('aria-label'))!.split(': ')[1];
  await page.getByRole('button', { name: `Kolor: ${color}`, exact: true }).click();
  const marker = field;
  const box = await marker.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + box!.width / 2, y = box!.y + box!.height / 2;
  if (isMobile) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y);
  await expect(page.getByText(/^Pokolorowane piksele: 1 \/ /)).toBeVisible();
  await page.mouse.click(x, y);
  await expect(page.getByText(/^Pokolorowane piksele: 1 \/ /)).toBeVisible();
  await page.getByRole('button', { name: 'Cofnij' }).click();
  await expect(page.getByText(/^Pokolorowane piksele: 0 \/ /)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cofnij' })).toBeDisabled();
  await finishPainting(page);
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('pixel canvas renders grid colors without numbers or photograph overlays', async ({ page }) => {
  await enter(page);
  await page.getByRole('button', { name: /Stańczyk.*Dostępna/ }).click();
  const canvas = page.getByLabel(/^Kolorowanie:/);
  const payload = await (await page.request.get('/artworks/stanczyk.json')).json();
  await expect(canvas.getByRole('button')).toHaveCount(payload.grid.width * payload.grid.height);
  await expect(canvas.locator('image, text')).toHaveCount(0);
  const field = canvas.getByRole('button').first();
  const color = (await field.getAttribute('aria-label'))!.split(': ')[1];
  await page.getByRole('button', { name: `Kolor: ${color}`, exact: true }).click();
  await field.press('Enter');
  await expect(field).toHaveAttribute('aria-pressed', 'true');
  const pixel = field.locator('..').locator('rect').first();
  await expect(pixel).toHaveAttribute('opacity', '1');
  const id = Number(await field.getAttribute('data-color-id'));
  await expect(pixel).toHaveAttribute('fill', payload.palette.find((entry: { id: number }) => entry.id === id).hex);
});

test('invalid artwork JSON can retry and pixel art needs no original image', async ({ page }) => {
  await page.route('**/artworks/stanczyk.json', route => route.fulfill({ json: { grid: { width: 32 } } }));
  await enter(page);
  await page.getByRole('button', { name: /Stańczyk.*Dostępna/ }).click();
  await expect(page.getByText('Nie udało się przygotować obrazu.')).toBeVisible();
  await page.unroute('**/artworks/stanczyk.json');
  await page.route('**/artworks/*.webp', route => route.abort());
  await page.getByRole('button', { name: 'Spróbuj ponownie' }).click();
  await expect(page.getByLabel(/^Kolorowanie:/)).toBeVisible();
  await expect(page.locator('.coloring-canvas image')).toHaveCount(0);
  await finishPainting(page);
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('color matching rejects wrong paint and plays distinct optional sounds', async ({ page }) => {
  await page.addInitScript(() => {
    const tracked = window as typeof window & { paintTones: string[] };
    tracked.paintTones = [];
    const original = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const voice = original.call(this), start = voice.start.bind(voice);
      voice.start = when => { tracked.paintTones.push(voice.type); start(when); };
      return voice;
    };
  });
  await enter(page);
  await page.getByRole('button', { name: 'Włącz dźwięk' }).click();
  await page.getByRole('button', { name: /Stańczyk.*Dostępna/ }).click();
  const brushes = page.getByRole('group', { name: 'Wybierz kolor' }).getByRole('button');
  await expect(brushes).toHaveCount(5);
  for (const count of await page.locator('.brush-count').allTextContents()) expect(Number(count.split('/')[1])).toBeGreaterThanOrEqual(5);
  const field = page.getByLabel(/^Kolorowanie:/).getByRole('button').first();
  const color = (await field.getAttribute('aria-label'))!.split(': ')[1];
  const right = page.getByRole('button', { name: `Kolor: ${color}`, exact: true });
  const tones = () => page.evaluate(() => (window as typeof window & { paintTones: string[] }).paintTones);
  const clear = () => page.evaluate(() => { (window as typeof window & { paintTones: string[] }).paintTones = []; });
  await brushes.evaluateAll((elements, name) => { (elements.find(element => element.getAttribute('aria-label') !== name) as HTMLButtonElement).click(); }, `Kolor: ${color}`);
  await clear();
  await field.press('Enter');
  await expect(page.getByText(`Ten piksel ma inny kolor. Wybierz: ${color}.`)).toBeVisible();
  await expect(page.getByText(/^Pokolorowane piksele: 0 \/ /)).toBeVisible();
  await expect.poll(tones).toContain('triangle');
  await right.click();
  await clear();
  await field.press('Enter');
  await expect(page.getByText(/^Pokolorowane piksele: 1 \/ /)).toBeVisible();
  await expect.poll(tones).toEqual(['sine','sine']);
  await page.getByRole('button', { name: 'Wyłącz dźwięk' }).click();
  await clear();
  await brushes.nth(0).click();
  await page.getByLabel(/^Kolorowanie:/).getByRole('button').nth(1).press('Enter');
  expect(await tones()).toEqual([]);
});

test('drag paints separate matching pixels and zoom supports panning', async ({ page }) => {
  const original = await (await page.request.get('/artworks/stanczyk.json')).json();
  await page.route('**/artworks/stanczyk.json', route => route.fulfill({ json: {
    ...original, grid: { width: 4, height: 2, data: [[17,17,17,17],[42,42,42,42]] },
    palette: [{ id: 17, hex: '#7A141A', name: 'Szkarłat' }, { id: 42, hex: '#C69C55', name: 'Złoto' }],
  } }));
  await enter(page);
  await page.getByRole('button', { name: /Stańczyk.*Dostępna/ }).click();
  await page.getByRole('button', { name: 'Kolor: Szkarłat', exact: true }).click();
  const canvas = page.getByLabel(/^Kolorowanie:/);
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 8, bounds.y + bounds.height / 4);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 7 / 8, bounds.y + bounds.height / 4, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByText('Pokolorowane piksele: 4 / 8')).toBeVisible();
  await expect(canvas.locator('[aria-pressed="true"]')).toHaveCount(4);
  await page.getByRole('button', { name: 'Powiększ płótno' }).click();
  await page.getByRole('button', { name: 'Przesuwaj płótno' }).click();
  await expect(canvas).toHaveClass(/is-panning/);
  await page.getByRole('button', { name: 'Kolor: Złoto', exact: true }).click();
  await expect(canvas).not.toHaveClass(/is-panning/);
});
