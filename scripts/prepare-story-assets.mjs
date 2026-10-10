import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

// Build-time image optimization only. Original ImageGen outputs remain untouched.
const source = process.argv[2];
if (!source) throw new Error('Pass the directory containing the generated PNG assets.');
const output = join(process.cwd(), 'public/assets');
await mkdir(output, { recursive: true });
const files = {
  exterior: 'exec-4c13b5fc-c65e-4ff1-b592-ded406ec48dc.png',
  interior: 'exec-8c5966b8-5685-47ac-ad87-288c179bd019.png',
  'exterior-mobile': 'exec-5ec83231-dfd9-4da9-9e91-dfdfdc02b40d.png',
  'interior-mobile': 'exec-d5a569d1-3e9c-4ad3-904f-9bc732981a84.png',
};
for (const [name, file] of Object.entries(files)) {
  await sharp(join(source, file)).webp({ quality: 85 }).toFile(join(output, `${name}.webp`));
}
const sprites = join(source, 'exec-da31319d-681b-4ae1-a0f2-c47a18fb759a.png');
const { width, height } = await sharp(sprites).metadata();
const column = Math.floor(width / 3);
for (let i = 0; i < 3; i++) {
  const extracted = await sharp(sprites).extract({ left: i * column, top: 0, width: column, height }).png().toBuffer();
  await sharp(extracted).trim().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 90 }).toFile(join(output, `reward-${i + 1}.webp`));
}
console.log('Prepared four scenes and three transparent rewards in public/assets.');
