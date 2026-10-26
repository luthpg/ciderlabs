import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import {
  type ArticleDocument,
  type Reaction,
  type ReactionSnapshot,
  type Reactions,
  snapshotSchema,
} from '../src/lib/schema.server.ts';

const number = z.number().int().nonnegative();

const zennResponse = z.object({
  article: z.object({
    slug: z.string(),
    liked_count: number,
    comments_count: number,
    user: z.object({
      username: z.string(),
    }),
  }),
});

const qiitaResponse = z.object({
  id: z.string(),
  private: z.boolean(),
  likes_count: number,
  stocks_count: number,
  comments_count: number,
  user: z.object({
    id: z.string(),
  }),
});

export async function readSnapshot(
  file: string,
): Promise<ReactionSnapshot | undefined> {
  try {
    return snapshotSchema.parse(JSON.parse(await readFile(file, 'utf8')));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
}

export async function refreshReactions(
  articles: ArticleDocument[],
  previous: ReactionSnapshot | undefined,
  options: {
    previousUrl?: string;
    qiitaToken?: string;
  },
): Promise<ReactionSnapshot> {
  const snapshot = previous ?? {
    version: 1 as const,
    items: {},
  };

  if (options.previousUrl) {
    try {
      const response = await fetch(options.previousUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      });

      if (response.status !== 404) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }

        const deployed = snapshotSchema.parse(await response.json());

        for (const [id, reactions] of Object.entries(deployed.items)) {
          snapshot.items[id] ??= {};

          for (const platform of ['zenn', 'qiita'] as const) {
            const remote = reactions[platform];
            const local = snapshot.items[id][platform];

            if (
              remote &&
              (!local ||
                Date.parse(remote.fetchedAt) > Date.parse(local.fetchedAt))
            ) {
              snapshot.items[id][platform] = remote;
            }
          }
        }
      }
    } catch (error) {
      if (!previous) {
        throw new Error(
          '前回リアクションを復元できません。公開済みサイトを保持します。',
          { cause: error },
        );
      }

      console.warn(
        '配信済みリアクションを取得できないため、ローカルキャッシュを使用します',
      );
    }
  }

  const blocked = new Set<'zenn' | 'qiita'>();
  const result: ReactionSnapshot = { version: 1, items: {} };

  for (const article of articles) {
    const next: Reactions = {};

    await Promise.all(
      (['zenn', 'qiita'] as const).map(async (platform) => {
        const url = platform === 'zenn' ? article.zennUrl : article.qiitaUrl;

        if (!url) return;

        const old = snapshot.items[article.id]?.[platform];

        if (old?.url === url) {
          next[platform] = old;
        }

        if (blocked.has(platform)) return;

        const source = new URL(url);
        const id = source.pathname.split('/').at(-1)!;
        const user = source.pathname.split('/')[1];

        const endpoint =
          platform === 'zenn'
            ? 'https://zenn.dev/api/articles/' + encodeURIComponent(id)
            : 'https://qiita.com/api/v2/items/' + encodeURIComponent(id);

        try {
          const headers: Record<string, string> = {
            Accept: 'application/json',
          };

          if (platform === 'qiita' && options.qiitaToken) {
            headers.Authorization = 'Bearer ' + options.qiitaToken;
          }

          const response = await fetch(endpoint, {
            headers,
            signal: AbortSignal.timeout(10000),
          });

          if (!response.ok) {
            if (
              [401, 403, 429].includes(response.status) ||
              response.status >= 500
            ) {
              blocked.add(platform);
            }

            throw new Error('HTTP ' + response.status);
          }

          const raw: unknown = await response.json();
          const fetchedAt = new Date().toISOString();
          let reaction: Reaction;

          if (platform === 'zenn') {
            const { article: item } = zennResponse.parse(raw);

            if (item.slug !== id || item.user.username !== user) {
              throw new Error('記事の識別情報が一致しません');
            }

            reaction = {
              url,
              likes: item.liked_count,
              comments: item.comments_count,
              fetchedAt,
            };
          } else {
            const item = qiitaResponse.parse(raw);

            if (item.private || item.id !== id || item.user.id !== user) {
              throw new Error('公開記事の識別情報が一致しません');
            }

            reaction = {
              url,
              likes: item.likes_count,
              comments: item.comments_count,
              stocks: item.stocks_count,
              fetchedAt,
            };
          }

          next[platform] = reaction;
        } catch {
          console.warn(
            platform + ': ' + article.id + ' の取得失敗。前回値を保持します',
          );
        }
      }),
    );

    result.items[article.id] = next;
  }

  return snapshotSchema.parse(result);
}
