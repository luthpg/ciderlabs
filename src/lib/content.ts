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
  /^(?:(?:GAS芸人の皆さん[、，\s]*)?こんにちは[、，！!。📝🦔👋\s]*(?:luthです[。！!📝🦔👋\s]*)?|はじめまして[、，！!。\s]*(?:luthです[。！!\s]*)?|どうも[、，\s]*luthです[。！!\s]*)+/u;

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
  個人開発: '個人開発',
};

export const EVENT_TAGS = new Set(['zennfes2025free', 'contest2025ts']);

export const PRIMARY_ARTICLE_TAGS = [
  'GAS',
  'TypeScript',
  '個人開発',
  'セキュリティ',
  'OSS',
] as const;

export const normalizeTag = (tag: string): string => {
  const trimmed = tag.trim();
  return TAG_ALIASES[trimmed.toLowerCase()] ?? trimmed;
};

export const isEventTag = (tag: string): boolean =>
  EVENT_TAGS.has(tag.trim().toLowerCase());

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
