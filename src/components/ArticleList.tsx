import { useState } from 'react';
import {
  type Article,
  cleanExcerpt,
  formatDate,
  getLatestReactionDate,
  normalizeTags,
  PRIMARY_ARTICLE_TAGS,
} from '../lib/content';
import Reactions from './Reactions';

export default function ArticleList({
  articles,
  limit,
  showFilters = true,
}: {
  articles: Article[];
  limit?: number;
  showFilters?: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);

  const normalizedArticles = articles.map((article) => ({
    ...article,
    tags: normalizeTags(article.tags),
    description: cleanExcerpt(article.description),
  }));

  const allTags = [
    ...new Set(normalizedArticles.flatMap((article) => article.tags)),
  ];

  const primarySet = new Set<string>(PRIMARY_ARTICLE_TAGS);
  const primaryTags = PRIMARY_ARTICLE_TAGS.filter((tag) =>
    allTags.includes(tag),
  );
  const secondaryTags = allTags.filter((tag) => !primarySet.has(tag));

  const filtered =
    active === null
      ? normalizedArticles
      : normalizedArticles.filter((article) => article.tags.includes(active));

  const visible = limit != null ? filtered.slice(0, limit) : filtered;
  const latestReactionDate = getLatestReactionDate(articles);

  const isSecondaryActive = active !== null && secondaryTags.includes(active);
  const displayedTags =
    showAllTags || isSecondaryActive
      ? [...primaryTags, ...secondaryTags]
      : primaryTags;

  return (
    <>
      {showFilters && (
        <div className="filters-bar">
          <fieldset className="filters" aria-label="記事のカテゴリ">
            {[null, ...displayedTags].map((tag) => (
              <button
                key={tag ?? 'all'}
                type="button"
                aria-pressed={active === tag}
                onClick={() => setActive(tag)}
              >
                {tag ?? `すべて (${normalizedArticles.length})`}
              </button>
            ))}

            {secondaryTags.length > 0 && (
              <button
                type="button"
                className="filter-more-toggle"
                aria-expanded={showAllTags || isSecondaryActive}
                onClick={() => setShowAllTags((prev) => !prev)}
              >
                {showAllTags || isSecondaryActive
                  ? '詳細タグを閉じる'
                  : `詳細なタグで絞り込む (+${secondaryTags.length})`}
              </button>
            )}
          </fieldset>

          <div className="filters-meta">
            <p className="filters-status" role="status">
              {active === null ? (
                <span>全{visible.length}件を表示中</span>
              ) : (
                <>
                  <span>
                    「<strong>{active}</strong>」の記事 {visible.length}件
                  </span>
                  <button
                    type="button"
                    className="filter-reset"
                    onClick={() => setActive(null)}
                  >
                    絞り込みを解除
                  </button>
                </>
              )}
            </p>

            {latestReactionDate && (
              <p className="reaction-date-note">
                外部指標の集計日:{' '}
                <time dateTime={latestReactionDate}>
                  {formatDate(latestReactionDate)}
                </time>
              </p>
            )}
          </div>
        </div>
      )}

      {!showFilters && latestReactionDate && (
        <p className="reaction-date-note mb-3">
          外部指標の集計日:{' '}
          <time dateTime={latestReactionDate}>
            {formatDate(latestReactionDate)}
          </time>
        </p>
      )}

      <div className="article-list">
        {visible.map((article) => (
          <article className="article-entry" key={article.id}>
            <a className="article-row" href={article.url}>
              <time dateTime={article.date}>{formatDate(article.date)}</time>

              <div>
                <div className="tags">
                  {article.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <h3>{article.title}</h3>

                <p className="article-summary">{article.description}</p>
              </div>

              <span aria-hidden="true">→</span>
            </a>

            <Reactions article={article} />
          </article>
        ))}
      </div>

      {!visible.length && <p className="py-8">該当する記事はありません。</p>}
    </>
  );
}
