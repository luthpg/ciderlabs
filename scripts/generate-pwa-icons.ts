import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

async function generateIcons() {
  const svgPath = resolve('public/favicon.svg');
  const svgContent = await readFile(svgPath, 'utf8');

  const iconsDir = resolve('public/icons');
  await mkdir(iconsDir, { recursive: true });

  const targets = [
    { name: 'icon-192x192.png', width: 192, height: 192 },
    { name: 'icon-512x512.png', width: 512, height: 512 },
    { name: 'apple-touch-icon.png', width: 180, height: 180 },
  ];

  for (const target of targets) {
    const resvg = new Resvg(svgContent, {
      fitTo: {
        mode: 'width',
        value: target.width,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    await writeFile(resolve(iconsDir, target.name), pngBuffer);
    console.log(`Generated: ${target.name} (${target.width}x${target.height})`);
  }

  // Maskable アイコン用（セーフゾーン余白を設けた SVG）
  // favicon.svg は 64x64 で rx=18 の角丸四角形背景を持つ。
  // マスク可能アイコンでは全画面を背景色 (#35654e) で埋め、中央にシンボルを配置
  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#35654e"/>
  <g transform="translate(6, 6) scale(0.8125)">
    <path
      d="M43 22a17 17 0 1 0 0 20"
      fill="none"
      stroke="#fff"
      stroke-width="7"
      stroke-linecap="round"
    />
    <circle cx="49" cy="14" r="8" fill="#f28c56"/>
  </g>
</svg>`;

  const maskableResvg = new Resvg(maskableSvg, {
    fitTo: {
      mode: 'width',
      value: 512,
    },
  });
  const maskablePng = maskableResvg.render().asPng();
  await writeFile(resolve(iconsDir, 'icon-maskable-512x512.png'), maskablePng);
  console.log('Generated: icon-maskable-512x512.png (512x512 maskable)');
}

generateIcons().catch((err) => {
  console.error(err);
  process.exit(1);
});
