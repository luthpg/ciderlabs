import type { APIRoute, GetStaticPaths } from 'astro';
import { getContent } from '../../../lib/cms.server';
import type { Library } from '../../../lib/content';
import { ogPngResponse, renderOgImage } from '../../../lib/og.server';

export const getStaticPaths = (async () => {
  const { libraries } = await getContent();

  return libraries.map((library) => ({
    params: { slug: library.slug },
    props: { library },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ library: Library }, { slug: string }> = async ({
  props,
}) => {
  const { library } = props;

  const png = await renderOgImage({
    eyebrow: 'DOCUMENTATION',
    meta: `${library.category} / 導入ガイド`,
    title: library.name,
    description: library.description,
    command: library.command,
  });

  return ogPngResponse(png);
};
