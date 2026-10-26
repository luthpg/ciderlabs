import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  type ArticleDocument,
  articleDocumentSchema,
  articleSchema,
} from './schema.server';

let cached: ArticleDocument[] | undefined;

export function getArticleDocuments() {
  const read = () =>
    articleDocumentSchema
      .array()
      .parse(
        JSON.parse(readFileSync(resolve('.generated/articles.json'), 'utf8')),
      );

  return import.meta.env.DEV
    ? read()
    : (() => {
        cached ??= read();
        return cached;
      })();
}

export function getArticles() {
  // 本文HTMLをReact islandのpropsに含めない。
  return getArticleDocuments().map((article) => articleSchema.parse(article));
}
