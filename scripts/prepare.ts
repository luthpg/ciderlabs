import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  articleDocumentSchema,
  type ReactionSnapshot,
} from '../src/lib/schema.server.ts';
import { buildArticles } from './articles.ts';
import { readSnapshot, refreshReactions } from './reactions.ts';

await rm('public/article-assets', {
  recursive: true,
  force: true,
});

await mkdir('.generated', { recursive: true });
await mkdir('.cache', { recursive: true });

const articles = await buildArticles(
  resolve(process.env.CONTENT_DIR || 'content-source'),
);

let snapshot = await readSnapshot('.cache/reactions.json');

if (process.argv.includes('--refresh-reactions') || !snapshot) {
  snapshot = await refreshReactions(articles, snapshot, {
    previousUrl: process.env.PREVIOUS_REACTIONS_URL || undefined,
    qiitaToken: process.env.QIITA_TOKEN || undefined,
  });

  await writeFile('.cache/reactions.json', JSON.stringify(snapshot, null, 2));
}

const published: ReactionSnapshot = {
  version: 1,
  items: {},
};

for (const article of articles) {
  const old = snapshot?.items[article.id];

  article.reactions = {
    ...(old?.zenn?.url === article.zennUrl && old?.zenn
      ? { zenn: old.zenn }
      : {}),
    ...(old?.qiita?.url === article.qiitaUrl && old?.qiita
      ? { qiita: old.qiita }
      : {}),
  };

  published.items[article.id] = article.reactions;
}

await writeFile(
  '.generated/articles.json',
  JSON.stringify(articleDocumentSchema.array().parse(articles)),
);

await writeFile('public/reactions.json', JSON.stringify(published));

console.log(`Prepared ${articles.length} published articles`);
