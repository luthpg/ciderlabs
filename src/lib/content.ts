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

import type { Project } from './schema.server';

export const docHref = (slug: string) => `/docs/${slug}/`;

export const projectHref = (project: Project) =>
  project.librarySlug ? docHref(project.librarySlug) : project.url!;

export const normalize = (value: string) =>
  value.normalize('NFKC').toLocaleLowerCase('ja-JP');

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
