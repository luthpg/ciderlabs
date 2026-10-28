export type {
  Article,
  ArticleDocument,
  Library,
  Project,
  Reaction,
  ReactionSnapshot,
  Reactions,
  SearchItem,
  SiteContent,
} from './schema.server';

import type { Article, Project } from './schema.server';

export const docHref = (slug: string) => `/docs/${slug}/`;

export const projectSlug = (project: Project): string => {
  if (project.slug) return project.slug;
  if (project.librarySlug) return project.librarySlug;
  const shortName = project.name.split(/\s+[-—–]\s+/)[0]?.trim() || project.id;
  return (
    shortName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || project.id
  );
};

export const projectDetailHref = (project: Project) =>
  `/projects/${projectSlug(project)}/`;

export const projectHref = (project: Project) =>
  project.librarySlug ? docHref(project.librarySlug) : (project.url ?? '#');

const GREETING_PATTERN =
  /^(?:(?:[^\s、，。！!]{1,20}(?:の皆さん|のみなさん|の方)[、，\s]*)?(?:こんにちは|はじめまして|どうも)[、，！!。📝🦔👋\s]*(?:[^\s、，。！!]{1,20}です[。！!📝🦔👋\s]*)?)+/u;

export const cleanExcerpt = (rawText: string, maxLength = 110): string => {
  const withoutGreeting = rawText
    .replace(GREETING_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim();
  const base = withoutGreeting || rawText.replace(/\s+/g, ' ').trim();
  const chars = Array.from(base);
  return chars.length > maxLength
    ? `${chars.slice(0, maxLength - 1).join('')}…`
    : chars.join('');
};

const TAG_ALIASES: Record<string, string> = {
  googleappsscript: 'GAS',
  gas: 'GAS',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  javascript: 'JavaScript',
  js: 'JavaScript',
  react: 'React',
  vue: 'Vue',
  vite: 'Vite',
  vitest: 'Vitest',
  webauthn: 'WebAuthn',
  e2ee: 'E2EE',
  security: 'セキュリティ',
  githubactions: 'GitHub Actions',
  clasp: 'clasp',
  nodejs: 'Node.js',
  fetch: 'fetch',
  frontend: 'Frontend',
  testing: 'テスト',
  npm: 'npm',
  oss: 'OSS',
  cli: 'CLI',
};

const EVENT_TAG_PATTERN = /(?:fes|contest)\d{4}|^\d{4}/i;

export const normalizeTag = (tag: string): string => {
  const trimmed = tag.trim();
  return TAG_ALIASES[trimmed.toLowerCase()] ?? trimmed;
};

export const isEventTag = (tag: string): boolean =>
  EVENT_TAG_PATTERN.test(tag.trim());

export const normalizeTags = (
  tags: string[],
  options?: { includeEventTags?: boolean },
): string[] => {
  const includeEvents = options?.includeEventTags ?? false;
  return [
    ...new Set(
      tags
        .filter((tag) => includeEvents || !isEventTag(tag))
        .map(normalizeTag)
        .filter(Boolean),
    ),
  ];
};

export const rankArticleTags = (
  articles: Pick<Article, 'tags'>[],
  primaryLimit = 5,
): { primaryTags: string[]; secondaryTags: string[] } => {
  const counts = new Map<string, number>();

  for (const article of articles) {
    for (const tag of normalizeTags(article.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
    .map(([tag]) => tag);

  return {
    primaryTags: sorted.slice(0, primaryLimit),
    secondaryTags: sorted.slice(primaryLimit),
  };
};

export const findRelatedArticles = (
  articles: Article[],
  target: {
    slug: string;
    name: string;
    tags?: string[];
  },
  limit = 3,
): Article[] => {
  const shortName =
    target.name
      .split(/\s+[-—–]\s+/)[0]
      ?.replace(/^@[a-z0-9_-]+\//i, '')
      .trim() || target.name;
  const primaryTerms = [target.slug, shortName]
    .map((term) => normalize(term))
    .filter((term) => term.length >= 3);
  const targetTags = new Set(normalizeTags(target.tags ?? []));

  const scored = articles
    .map((article) => {
      const haystack = normalize(
        `${article.slug} ${article.title} ${article.description}`,
      );
      let score = 0;

      for (const term of primaryTerms) {
        if (haystack.includes(term)) {
          score += 10;
        }
      }

      for (const tag of normalizeTags(article.tags)) {
        if (targetTags.has(tag)) {
          score += 2;
        }
      }

      return { article, score };
    })
    .filter(({ score }) => score >= 4)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ article }) => article);
};

export const getLatestReactionDate = (articles: Article[]): string | null => {
  let latest = 0;
  let latestIso: string | null = null;

  for (const article of articles) {
    for (const reaction of [article.reactions.zenn, article.reactions.qiita]) {
      if (!reaction?.fetchedAt) continue;
      const time = Date.parse(reaction.fetchedAt);
      if (time > latest) {
        latest = time;
        latestIso = reaction.fetchedAt;
      }
    }
  }

  return latestIso;
};

export const normalize = (value: string) =>
  value.normalize('NFKC').toLocaleLowerCase('ja-JP');

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
