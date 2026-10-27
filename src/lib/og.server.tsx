import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori, { type Font } from 'satori';
import { site } from '../config/site';

export const OG_WIDTH = 1280;
export const OG_HEIGHT = 720;

export interface OgSlideProps {
  eyebrow: string;
  meta?: string;
  title: string;
  description?: string;
  tags?: string[];
  command?: string;
}

const FONT_CACHE_DIR = resolve('.generated/fonts');

let fontsPromise: Promise<Font[]> | undefined;

async function fetchGoogleFont(weight: 500 | 700): Promise<ArrayBuffer> {
  const cachePath = resolve(FONT_CACHE_DIR, `NotoSansJP-${weight}.ttf`);
  if (existsSync(cachePath)) {
    const buf = readFileSync(cachePath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&display=swap`;
  const cssResponse = await fetch(cssUrl, {
    headers: {
      // Request raw TTF from Google Fonts API for Satori compatibility
      'User-Agent':
        'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
    },
  });

  if (!cssResponse.ok) {
    throw new Error(`Failed to fetch Google Fonts CSS (${cssResponse.status})`);
  }

  const css = await cssResponse.text();
  const match = css.match(
    /src:\s*url\(([^)]+)\)\s*format\(['"]?truetype['"]?\)/,
  );
  const fontUrl = match?.[1] ?? css.match(/url\((https:\/\/[^)]+)\)/)?.[1];

  if (!fontUrl) {
    throw new Error('Could not find font URL in Google Fonts CSS');
  }

  const fontResponse = await fetch(fontUrl);
  if (!fontResponse.ok) {
    throw new Error(`Failed to fetch font binary (${fontResponse.status})`);
  }

  const arrayBuffer = await fontResponse.arrayBuffer();
  mkdirSync(FONT_CACHE_DIR, { recursive: true });
  writeFileSync(cachePath, Buffer.from(arrayBuffer));
  return arrayBuffer;
}

function getFonts(): Promise<Font[]> {
  fontsPromise ??= Promise.all([
    fetchGoogleFont(500),
    fetchGoogleFont(700),
  ]).then(([medium, bold]) => [
    {
      name: 'Noto Sans JP',
      data: medium,
      weight: 500,
      style: 'normal',
    },
    {
      name: 'Noto Sans JP',
      data: bold,
      weight: 700,
      style: 'normal',
    },
  ]);

  return fontsPromise;
}

function clampText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

export async function renderOgImage({
  eyebrow,
  meta,
  title,
  description,
  tags = [],
  command,
}: OgSlideProps): Promise<Uint8Array> {
  const fonts = await getFonts();
  const displayTitle = clampText(title, 68);
  const displayDesc = description ? clampText(description, 96) : undefined;
  const titleSize =
    displayTitle.length > 42 ? 42 : displayTitle.length > 26 ? 48 : 54;

  const element = (
    <div
      style={{
        width: '1280px',
        height: '720px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#eef6f0',
        fontFamily: '"Noto Sans JP"',
        color: '#1d3429',
      }}
    >
      {/* 背景の装飾リング・太陽ディスク */}
      <div
        style={{
          position: 'absolute',
          right: '-60px',
          top: '-60px',
          width: '380px',
          height: '380px',
          borderRadius: '999px',
          backgroundColor: '#dbeade',
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '24px',
          top: '16px',
          width: '160px',
          height: '160px',
          borderRadius: '999px',
          backgroundColor: '#f28c56',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '-40px',
          bottom: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '999px',
          backgroundColor: '#fff1e7',
        }}
      />

      {/* スライド本体カード */}
      <div
        style={{
          position: 'relative',
          width: '1160px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          border: '2px solid #dce5de',
          borderRadius: '28px',
          padding: '44px 56px',
          boxShadow: '0 20px 50px rgba(29, 52, 41, 0.08)',
        }}
      >
        {/* 上部バー: カテゴリ・メタ情報 ＆ ブランドロゴ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span
              style={{
                backgroundColor: '#eef6f0',
                color: '#35654e',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                padding: '8px 18px',
                borderRadius: '999px',
              }}
            >
              {eyebrow}
            </span>
            {meta && (
              <span
                style={{
                  color: '#64786b',
                  fontSize: '20px',
                  fontWeight: 500,
                }}
              >
                {meta}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#35654e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                fontWeight: 700,
              }}
            >
              <span>c</span>
              <div
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '999px',
                  backgroundColor: '#f28c56',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                fontSize: '28px',
                fontWeight: 700,
                color: '#1d3429',
                letterSpacing: '-0.02em',
              }}
            >
              <span>{site.name}</span>
              <span style={{ color: '#f28c56' }}>.</span>
            </div>
          </div>
        </div>

        {/* 中央: タイトル・アクセントライン・説明文 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginTop: '12px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              fontSize: `${titleSize}px`,
              fontWeight: 700,
              color: '#1d3429',
              lineHeight: 1.38,
              letterSpacing: '-0.025em',
              wordBreak: 'break-word',
            }}
          >
            {displayTitle}
          </div>

          <div
            style={{
              width: '84px',
              height: '7px',
              borderRadius: '999px',
              backgroundColor: '#f28c56',
            }}
          />

          {displayDesc && (
            <div
              style={{
                fontSize: '23px',
                fontWeight: 500,
                color: '#506459',
                lineHeight: 1.55,
              }}
            >
              {displayDesc}
            </div>
          )}
        </div>

        {/* 下部バー: タグ / コマンド ＆ 著者・ドメイン */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #dce5de',
            paddingTop: '24px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {command ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#284d3c',
                  color: '#dbeade',
                  padding: '8px 20px',
                  borderRadius: '10px',
                  fontSize: '19px',
                  fontWeight: 700,
                }}
              >
                <span style={{ color: '#f28c56' }}>$</span>
                <span>{clampText(command, 48)}</span>
              </div>
            ) : (
              tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: '#eef6f0',
                    color: '#35654e',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                >
                  #{tag}
                </span>
              ))
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#64786b',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            <span style={{ color: '#35654e' }}>@{site.author}</span>
            <span>·</span>
            <span>ciderlabs.link</span>
          </div>
        </div>
      </div>
    </div>
  );

  const svg = await satori(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: OG_WIDTH,
    },
  });

  return resvg.render().asPng();
}

export function ogPngResponse(png: Uint8Array): Response {
  return new Response(Buffer.from(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
