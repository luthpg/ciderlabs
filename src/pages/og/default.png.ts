import type { APIRoute } from 'astro';
import { site } from '../../config/site';
import { ogPngResponse, renderOgImage } from '../../lib/og.server';

export const GET: APIRoute = async () => {
  const png = await renderOgImage({
    eyebrow: 'BUILD. WRITE. SHARE.',
    meta: 'PORTFOLIO & TECH LOG',
    title: '小さな不便を、つくる楽しさに。',
    description: site.description,
    tags: site.keywords,
  });

  return ogPngResponse(png);
};
