import type { APIRoute } from 'astro';

import { getContent } from '../lib/cms.server';
import { docHref, projectHref, type SearchItem } from '../lib/content';

export const GET: APIRoute = async () => {
  const { projects, articles, libraries } = await getContent();

  const items: SearchItem[] = [
    ...projects.map((project) => ({
      title: project.name,
      href: projectHref(project),
      kind: 'つくったもの',
      keywords: `${project.description} ${project.tags.join(' ')}`,
    })),
    ...articles.map((article) => ({
      title: article.title,
      href: article.url,
      kind: '技術記事',
      keywords: `${article.description} ${article.tags.join(' ')}`,
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
