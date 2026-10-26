import { createClient } from 'microcms-js-sdk';
import { z } from 'zod';
import { getArticles } from './articles.server';
import {
  librarySchema,
  projectSchema,
  type SiteContent,
} from './schema.server';

async function fetchContent(): Promise<SiteContent> {
  const env = z
    .object({
      domain: z.string().regex(/^[a-z0-9-]+$/),
      key: z.string().min(1),
    })
    .parse({
      domain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
      key: import.meta.env.MICROCMS_API_KEY,
    });

  const client = createClient({
    serviceDomain: env.domain,
    apiKey: env.key,
  });

  const [rawProjects, rawLibraries] = await Promise.all([
    client.getAllContents({
      endpoint: 'projects',
      queries: { orders: 'order' },
    }),
    client.getAllContents({
      endpoint: 'libraries',
      queries: { orders: 'order' },
    }),
  ]);

  const projects = z.array(projectSchema).parse(rawProjects);
  const libraries = z.array(librarySchema).parse(rawLibraries);
  const articles = getArticles();

  const slugs = new Set(libraries.map((library) => library.slug));

  if (slugs.size !== libraries.length) {
    throw new Error('ライブラリのslugが重複しています');
  }

  if (projects.filter((project) => project.featured).length > 1) {
    throw new Error('featuredは1件までです');
  }

  for (const project of projects) {
    if (project.librarySlug && !slugs.has(project.librarySlug)) {
      throw new Error(`${project.name}: librarySlugの参照先がありません`);
    }
  }

  return { projects, articles, libraries };
}

let pending: Promise<SiteContent> | undefined;

export function getContent() {
  // 開発中はページ再読み込みでCMSの変更を取得する。
  if (import.meta.env.DEV) return fetchContent();

  // ビルド中は各ページで取得結果を共有する。
  pending ??= fetchContent();

  return pending;
}
