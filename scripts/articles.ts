import { readFile, realpath, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { z } from 'zod';
import { renderMarkdown } from '../src/lib/markdown.server.ts';
import type { ArticleDocument } from '../src/lib/schema.server.ts';
import {
  buildSourceIndex,
  readMarkdown,
  resolveInside,
} from './source-index.ts';

const frontmatterSchema = z.object({
  title: z.string().trim().min(1),
  topics: z.array(z.string()).optional(),
  tags: z
    .array(
      z.union([
        z.string(),
        z
          .object({
            name: z.string(),
          })
          .transform((tag) => tag.name),
      ]),
    )
    .optional(),
});

export async function buildArticles(
  contentDirectory: string,
): Promise<ArticleDocument[]> {
  const root = await realpath(contentDirectory);
  const withinRoot = (candidate: string) => resolveInside(root, candidate);

  const published = await buildSourceIndex(root);
  const files = new Map<string, string>();

  for (const article of published) {
    const file = await withinRoot(path.resolve(root, article.file));

    if (!file.endsWith('.md')) {
      throw new Error('Markdownファイルを指定してください');
    }

    files.set(file, '/articles/' + article.slug + '/');
  }

  await mkdir('public/article-assets', {
    recursive: true,
  });

  const output: ArticleDocument[] = [];

  for (const article of published) {
    const source = await withinRoot(path.resolve(root, article.file));

    const markdown = await readMarkdown(source);
    const meta = frontmatterSchema.parse(markdown.meta);
    const rendered = await renderMarkdown(markdown.body);
    const $ = load(rendered.html, {}, false);

    for (const element of $('img[src], a[href]').toArray()) {
      const node = $(element);
      const isImage = element.tagName === 'img';
      const attribute = isImage ? 'src' : 'href';
      const rawUrl = node.attr(attribute)!;

      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(rawUrl)) {
        continue;
      }

      const match = rawUrl.match(/^([^?#]+)(.*)$/);

      if (!match) {
        continue;
      }

      const pathname = decodeURIComponent(match[1]);
      const extension = path.extname(pathname).toLowerCase();
      const isMarkdown = extension === '.md';

      const isAsset = [
        '.png',
        '.jpg',
        '.jpeg',
        '.webp',
        '.gif',
        '.avif',
        '.svg',
        '.pdf',
      ].includes(extension);

      if (!isImage && !isMarkdown && !isAsset) {
        continue;
      }

      const local = await withinRoot(
        pathname.startsWith('/')
          ? path.resolve(root, '.' + pathname)
          : path.resolve(path.dirname(source), pathname),
      );

      if (isMarkdown) {
        const href = files.get(local);

        if (!href) {
          throw new Error('未公開記事へのリンクがあります: ' + rawUrl);
        }

        node.attr(attribute, href + match[2]);
        continue;
      }

      if (!isAsset) {
        throw new Error('未対応の画像形式です: ' + rawUrl);
      }

      const bytes = await readFile(local);
      const filename =
        createHash('sha256').update(bytes).digest('hex') + extension;

      await writeFile(path.join('public/article-assets', filename), bytes);

      node.attr(attribute, '/article-assets/' + filename + match[2]);
    }

    output.push({
      id: article.id,
      slug: article.slug,
      title: meta.title,
      description: article.description,
      url: '/articles/' + article.slug + '/',
      tags: [...new Set(meta.topics ?? meta.tags ?? [])],
      date: article.publishedAt,
      updatedAt: article.updatedAt,
      zennUrl: article.zenn
        ? 'https://zenn.dev/' +
          article.zenn.user +
          '/articles/' +
          article.zenn.slug
        : undefined,
      qiitaUrl: article.qiita
        ? 'https://qiita.com/' +
          article.qiita.user +
          '/items/' +
          article.qiita.id
        : undefined,
      reactions: {},
      html: $.html(),
      headings: rendered.headings,
      hasEmbeds: rendered.hasEmbeds,
      hasMath: rendered.hasMath,
    });
  }

  return output.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}
