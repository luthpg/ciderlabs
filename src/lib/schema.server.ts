import { z } from 'zod';

const text = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const url = z.url().refine((value) => new URL(value).protocol === 'https:');
const date = z.iso.datetime({ offset: true });
const count = z.number().int().nonnegative();
const user = z.string().regex(/^[a-zA-Z0-9_-]+$/);

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    schema.optional(),
  );

const tags = z
  .string()
  .optional()
  .default('')
  .transform((value) => [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ]);

const base = z.object({ id: text });

export const librarySchema = base.extend({
  slug,
  name: text,
  category: text,
  description: text,
  command: text,
  repoUrl: url,
  npmUrl: url,
  markdown: text,
  order: z.number().int(),
});

export const projectVisualValues = [
  'poohma',
  'webapp',
  'browser',
  'mobile',
  'chat',
  'api',
  'terminal',
  'code',
  'dashboard',
  'automation',
  'extension',
  'security',
] as const;

const projectVisual = z.enum(projectVisualValues);

export const projectSchema = base
  .extend({
    slug: optional(slug),
    name: text,
    category: text,
    description: text,
    visual: z.union([
      projectVisual,
      z.tuple([projectVisual]).transform(([value]) => value),
    ]),
    featured: z.boolean().default(false),
    tags,
    url: optional(url),
    repoUrl: optional(url),
    librarySlug: optional(slug),
    markdown: optional(text),
    order: z.number().int(),
  })
  .refine((project) => Boolean(project.url || project.librarySlug), {
    message: 'url または librarySlug が必要です',
  });

export const sourceIndexSchema = z.array(
  z
    .object({
      id: slug,
      slug,
      file: text,
      description: text,
      published: z.boolean(),
      publishedAt: date,
      updatedAt: date.optional(),
      zenn: z
        .object({
          user,
          slug: z.string().regex(/^[a-z0-9_-]+$/),
        })
        .nullable()
        .optional(),
      qiita: z
        .object({
          user,
          id: z.string().regex(/^[a-f0-9]{20}$/),
        })
        .nullable()
        .optional(),
    })
    .refine(
      (article) =>
        !article.updatedAt ||
        Date.parse(article.updatedAt) >= Date.parse(article.publishedAt),
      { message: 'updatedAtはpublishedAt以降にしてください' },
    ),
);

export const reactionSchema = z.object({
  url,
  likes: count,
  comments: count,
  stocks: count.optional(),
  fetchedAt: date,
});

export const reactionsSchema = z.object({
  zenn: reactionSchema.optional(),
  qiita: reactionSchema.optional(),
});

export const snapshotSchema = z.object({
  version: z.literal(1),
  items: z.record(z.string(), reactionsSchema),
});

export const articleSchema = z.object({
  id: slug,
  slug,
  title: text,
  description: text,
  url: z.string().regex(/^\/articles\/[a-z0-9-]+\/$/),
  tags: z.array(text),
  date,
  updatedAt: date.optional(),
  zennUrl: url.optional(),
  qiitaUrl: url.optional(),
  reactions: reactionsSchema,
});

export const articleDocumentSchema = articleSchema.extend({
  markdown: z.string(),
  html: z.string(),
  headings: z.array(
    z.object({
      id: text,
      text: z.string(),
      level: z.number().int(),
    }),
  ),
  hasEmbeds: z.boolean(),
  hasMath: z.boolean(),
});

export type Library = z.infer<typeof librarySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Article = z.infer<typeof articleSchema>;
export type ArticleDocument = z.infer<typeof articleDocumentSchema>;
export type SourceArticle = z.infer<typeof sourceIndexSchema>[number];
export type Reaction = z.infer<typeof reactionSchema>;
export type Reactions = z.infer<typeof reactionsSchema>;
export type ReactionSnapshot = z.infer<typeof snapshotSchema>;

export type SiteContent = {
  projects: Project[];
  articles: Article[];
  libraries: Library[];
};

export type SearchItem = {
  title: string;
  href: string;
  kind: string;
  keywords: string;
};
