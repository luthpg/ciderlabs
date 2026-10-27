import { readdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import { renderMarkdown } from '../src/lib/markdown.server.ts';
import {
  type SourceArticle,
  sourceIndexSchema,
} from '../src/lib/schema.server.ts';

const text = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const user = z.string().regex(/^[a-zA-Z0-9_-]+$/);
const date = z.iso.datetime({ offset: true });

const configSchema = z
  .object({
    zennUser: user,
    qiitaUser: user,
  })
  .strict();

const overridesSchema = z.record(
  z.string(),
  z
    .object({
      id: slug.optional(),
      slug: slug.optional(),
      published: z.boolean().optional(),
      publishedAt: date.optional(),
      updatedAt: date.optional(),
      description: text.optional(),
      qiitaFile: text.nullable().optional(),
    })
    .strict(),
);

const zennSchema = z.object({
  title: text,
  published: z.boolean(),
  published_at: z.string().optional(),
});

const qiitaSchema = z.object({
  private: z.boolean(),
  id: z
    .string()
    .regex(/^[a-f0-9]{20}$/)
    .nullable()
    .optional(),
});

export async function resolveInside(root: string, relative: string) {
  const file = await realpath(path.resolve(root, relative));
  const remainder = path.relative(root, file);

  if (
    remainder === '..' ||
    remainder.startsWith(`..${path.sep}`) ||
    path.isAbsolute(remainder)
  ) {
    throw new Error(`記事リポジトリ外の参照です: ${relative}`);
  }

  return file;
}

function missing(error: unknown) {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

export async function readMarkdown(file: string) {
  const raw = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '');
  const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!front) {
    throw new Error(`YAML frontmatterが必要です: ${file}`);
  }

  return {
    meta: parseYaml(front[1], {
      schema: 'core',
      uniqueKeys: true,
    }) as unknown,
    body: raw.slice(front[0].length),
  };
}

function zennDate(value: string, file: string) {
  const match = /^(\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}))?$/.exec(value);

  if (!match) {
    throw new Error(`published_atの形式が不正です: ${file}`);
  }

  const local = `${match[1]}T${match[2] ?? '00:00'}:00`;
  const parsed = Date.parse(`${local}+09:00`);

  if (
    !Number.isFinite(parsed) ||
    new Date(parsed + 9 * 60 * 60 * 1000).toISOString().slice(0, 19) !== local
  ) {
    throw new Error(`published_atの日付が不正です: ${file}`);
  }

  return `${local}+09:00`;
}

async function excerpt(body: string, title: string) {
  const { html } = await renderMarkdown(body);
  const $ = load(html, {}, false);
  let result = '';

  for (const paragraph of $.root().children('p').toArray()) {
    const node = $(paragraph).clone();
    node.find('img, iframe, script, style, sup').remove();

    const candidate = node.text().replace(/\s+/g, ' ').trim();

    if (candidate) {
      result = candidate;
      break;
    }
  }

  const characters = Array.from(result || title);

  return characters.length > 160
    ? `${characters.slice(0, 159).join('')}…`
    : characters.join('');
}

export async function buildSourceIndex(
  directory: string,
  now = Date.now(),
): Promise<SourceArticle[]> {
  const root = await realpath(directory);

  const readJson = async (file: string) =>
    JSON.parse(
      await readFile(await resolveInside(root, file), 'utf8'),
    ) as unknown;

  const config = configSchema.parse(await readJson('site/config.json'));

  const overrides = overridesSchema.parse(
    await readJson('site/overrides.json'),
  );

  const directoryPath = await resolveInside(root, 'articles');
  const names = (await readdir(directoryPath))
    .filter((name) => name.endsWith('.md'))
    .sort();

  const known = new Set(names.map((name) => name.slice(0, -3)));

  for (const key of Object.keys(overrides)) {
    if (!known.has(key)) {
      throw new Error(`原稿のないoverrideです: ${key}`);
    }
  }

  const articles: SourceArticle[] = [];
  const qiitaIds = new Set<string>();

  for (const name of names) {
    const stem = name.slice(0, -3);

    if (!/^[a-z0-9_-]+$/.test(stem)) {
      throw new Error(`不正な記事ファイル名です: ${name}`);
    }

    const file = `articles/${name}`;
    const source = await readMarkdown(await resolveInside(root, file));

    const meta = zennSchema.parse(source.meta);
    const override = overrides[stem] ?? {};

    if (!(override.published ?? meta.published)) {
      continue;
    }

    const publishedAt =
      override.publishedAt ??
      (meta.published_at ? zennDate(meta.published_at, file) : undefined);

    if (!publishedAt) {
      throw new Error(
        `公開日をpublished_atまたはoverrideに設定してください: ${file}`,
      );
    }

    if (Date.parse(publishedAt) > now) {
      continue;
    }

    let qiita: SourceArticle['qiita'] = null;

    if (override.qiitaFile !== null) {
      const relative = override.qiitaFile ?? `qiita/public/${name}`;

      let qiitaPath: string | undefined;

      try {
        qiitaPath = await resolveInside(root, relative);
      } catch (error) {
        if (override.qiitaFile !== undefined || !missing(error)) {
          throw error;
        }
      }

      if (qiitaPath) {
        const metadata = qiitaSchema.parse(
          (await readMarkdown(qiitaPath)).meta,
        );

        if (!metadata.private && metadata.id) {
          if (qiitaIds.has(metadata.id)) {
            throw new Error(`Qiita IDが重複しています: ${metadata.id}`);
          }

          qiitaIds.add(metadata.id);

          qiita = {
            user: config.qiitaUser,
            id: metadata.id,
          };
        }
      }
    }

    const defaultSlug = stem
      .replace(/_/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const zennPublishedAt = meta.published_at
      ? Date.parse(zennDate(meta.published_at, file))
      : undefined;

    articles.push({
      id: override.id ?? defaultSlug,
      slug: override.slug ?? defaultSlug,
      file,
      description:
        override.description ?? (await excerpt(source.body, meta.title)),
      published: true,
      publishedAt,
      updatedAt: override.updatedAt,
      zenn:
        meta.published &&
        (zennPublishedAt === undefined || zennPublishedAt <= now)
          ? {
              user: config.zennUser,
              slug: stem,
            }
          : null,
      qiita,
    });
  }

  const index = sourceIndexSchema.parse(articles);

  for (const key of ['id', 'slug', 'file'] as const) {
    const values = new Set(index.map((article) => article[key]));

    if (values.size !== index.length) {
      throw new Error(`記事一覧の${key}が重複しています`);
    }
  }

  return index;
}
