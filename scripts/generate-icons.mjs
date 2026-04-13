import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = await readFile(join(root, 'src/app/icon.svg'));
const outDir = join(root, 'public/icons');
await mkdir(outDir, { recursive: true });

const maskableSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#3d2b1f"/>
  <g transform="translate(64 64) scale(0.75)" fill="#f5f0e8">
    <ellipse cx="256" cy="320" rx="90" ry="72"/>
    <ellipse cx="140" cy="232" rx="44" ry="56"/>
    <ellipse cx="372" cy="232" rx="44" ry="56"/>
    <ellipse cx="196" cy="140" rx="38" ry="50"/>
    <ellipse cx="316" cy="140" rx="38" ry="50"/>
  </g>
</svg>`);

const targets = [
  { input: svg, name: 'icon-192.png', size: 192 },
  { input: svg, name: 'icon-512.png', size: 512 },
  { input: maskableSvg, name: 'icon-maskable-192.png', size: 192 },
  { input: maskableSvg, name: 'icon-maskable-512.png', size: 512 },
];

for (const { input, name, size } of targets) {
  const buf = await sharp(input).resize(size, size).png().toBuffer();
  await writeFile(join(outDir, name), buf);
  console.log('wrote', name);
}