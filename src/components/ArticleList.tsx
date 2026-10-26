import { useState } from 'react';
import { type Article, formatDate } from '../lib/content';
import Reactions from './Reactions';

export default function ArticleList({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState<string | null>(null);
  const tags = [...new Set(articles.flatMap((article) => article.tags))];

  const visible =
    active === null
      ? articles
      : articles.filter((article) => article.tags.includes(active));

  return (
    <>
      <fieldset className="filters" aria-label="記事のカテゴリ">
        {[null, ...tags].map((tag) => (
          <button
            key={tag ?? 'all'}
            type="button"
            aria-pressed={active === tag}
            onClick={() => setActive(tag)}
          >
            {tag ?? 'すべて'}
          </button>
        ))}
      </fieldset>

      <p className="sr-only" role="status">
        {visible.length}件の記事
      </p>

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
