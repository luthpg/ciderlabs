import type { APIRoute, GetStaticPaths } from 'astro';
import { getArticleDocuments } from '../../../lib/articles.server';
import {
  type ArticleDocument,
  cleanExcerpt,
  formatDate,
  normalizeTags,
} from '../../../lib/content';
import { ogPngResponse, renderOgImage } from '../../../lib/og.server';

export const getStaticPaths = (() =>
  getArticleDocuments().map((article) => ({
    params: { slug: article.slug },
    props: { article },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<
  { article: ArticleDocument },
  { slug: string }
> = async ({ props }) => {
  const { article } = props;
  const dateLabel = article.updatedAt
    ? `${formatDate(article.date)} 公開 · ${formatDate(article.updatedAt)} 更新`
    : `${formatDate(article.date)} 公開`;

  const png = await renderOgImage({
    eyebrow: 'ARTICLE',
    meta: dateLabel,
    title: article.title,
    description: cleanExcerpt(article.description, 120),
    tags: normalizeTags(article.tags),
  });

  return ogPngResponse(png);
};
