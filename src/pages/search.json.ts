import type { APIRoute } from 'astro';

import { getContent } from '../lib/cms.server';
import {
  cleanExcerpt,
  docHref,
  normalizeTags,
  projectDetailHref,
  type SearchItem,
} from '../lib/content';
import { getProjectSpec } from '../lib/projects';

export const GET: APIRoute = async () => {
  const { projects, articles, libraries } = await getContent();

  const items: SearchItem[] = [
    ...projects
      .filter((project) => !project.librarySlug)
      .map((project) => {
        const spec = getProjectSpec(project);
        return {
          title: project.name,
          href: projectDetailHref(project),
          kind: 'つくったもの',
          keywords: `${spec.userSummary} ${project.description} ${project.tags.join(' ')}`,
        };
      }),
    ...articles.map((article) => ({
      title: article.title,
      href: article.url,
      kind: '技術記事',
      keywords: `${cleanExcerpt(article.description)} ${normalizeTags(article.tags).join(' ')}`,
    })),
    ...libraries.map((library) => ({
      title: library.name,
      href: docHref(library.slug),
      kind: 'ドキュメント',
      keywords: `${library.description} ${library.category}`,
    })),
  ];

  return Response.json(items);
};
