import { useState } from 'react';
import {
  buildLibrarySearchText,
  docHref,
  type Library,
  normalize,
} from '../lib/content';

export default function LibraryList({ libraries }: { libraries: Library[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const categories = [...new Set(libraries.map((library) => library.category))];

  const words = normalize(query).trim().split(/\s+/).filter(Boolean);

  const filtered = libraries.filter((library) => {
    if (activeCategory !== null && library.category !== activeCategory) {
      return false;
    }

    if (words.length === 0) {
      return true;
    }

    const haystack = normalize(
      `${library.name} ${buildLibrarySearchText(library)}`,
    );

    return words.every((word) => haystack.includes(word));
  });

  const hasFilter = activeCategory !== null || query.trim().length > 0;

  return (
    <>
      <div className="filters-bar">
        <div className="mb-4 max-w-md">
          <label className="sr-only" htmlFor="library-filter-search">
            ライブラリを検索
          </label>
          <input
            id="library-filter-search"
            type="search"
            className="w-full rounded-lg border border-line bg-card px-4 py-2.5 text-sm text-ink placeholder:text-muted"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="パッケージ名・用途・キーワードで検索（例: GAS, Vite, Vitest）"
            autoComplete="off"
          />
        </div>

        {/* biome-ignore lint/a11y/useSemanticElements: 非フォーム要素のグループ化のため role="group" を使用 */}
        <div role="group" className="filters" aria-label="ライブラリのカテゴリ">
          {[null, ...categories].map((category) => {
            const count =
              category === null
                ? libraries.length
                : libraries.filter((lib) => lib.category === category).length;

            return (
              <button
                key={category ?? 'all'}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category === null
                  ? `すべて (${count})`
                  : `${category} (${count})`}
              </button>
            );
          })}
        </div>

        <div className="filters-meta">
          <p className="filters-status" role="status">
            {!hasFilter ? (
              <span>全{filtered.length}件を表示中</span>
            ) : (
              <>
                <span>
                  {activeCategory !== null && (
                    <>
                      カテゴリ「<strong>{activeCategory}</strong>」
                    </>
                  )}
                  {activeCategory !== null && query.trim() && ' · '}
                  {query.trim() && (
                    <>
                      キーワード「<strong>{query.trim()}</strong>」
                    </>
                  )}
                  のライブラリ {filtered.length}件
                </span>
                <button
                  type="button"
                  className="filter-reset"
                  onClick={() => {
                    setActiveCategory(null);
                    setQuery('');
                  }}
                >
                  絞り込みを解除
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="library-grid">
        {filtered.map((library) => (
          <article className="library-card" key={library.id}>
            <div className="flex items-center justify-between gap-4">
              <span className="package-icon" aria-hidden="true">
                ⌘
              </span>
              <span className="tag">{library.category}</span>
            </div>

            <h3>
              <a href={docHref(library.slug)}>{library.name}</a>
            </h3>
            <p>{library.description}</p>

            <div className="install">
              <code>{library.command}</code>
              <button
                type="button"
                className="copy-btn"
                data-copy={library.command}
                aria-label={`${library.name}のインストールコマンドをコピー`}
              >
                <svg
                  className="copy-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <svg
                  className="check-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="copy-label">コピー</span>
              </button>
            </div>

            <div className="card-links">
              <a href={docHref(library.slug)}>導入ガイド →</a>
              <a
                href={library.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </a>
              <a
                href={library.npmUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                npm ↗
              </a>
            </div>
          </article>
        ))}
      </div>

      {!filtered.length && (
        <p className="py-8">該当するライブラリはありません。</p>
      )}
    </>
  );
}
