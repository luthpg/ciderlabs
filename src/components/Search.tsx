import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalize, type SearchItem } from '../lib/content';

function scoreSearchItem(item: SearchItem, words: string[]): number {
  const normTitle = normalize(item.title);
  const normKeywords = normalize(item.keywords);
  const haystack = `${normTitle} ${normKeywords}`;

  if (!words.every((word) => haystack.includes(word))) {
    return -1;
  }

  let score = 0;
  for (const word of words) {
    if (normTitle === word || normTitle.startsWith(word)) {
      score += 100;
    } else if (normTitle.includes(word)) {
      score += 60;
    } else if (normKeywords.includes(word)) {
      score += 15;
    }
  }

  if (item.kind === 'ドキュメント' || item.kind === 'つくったもの') {
    score += 20;
  }

  return score;
}

export default function Search() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const request = useRef<Promise<SearchItem[]> | null>(null);

  const [items, setItems] = useState<SearchItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const load = useCallback(async () => {
    setStatus('loading');

    try {
      request.current ??= fetch('/search.json').then(async (response) => {
        if (!response.ok) {
          throw new Error('検索データを取得できませんでした');
        }
        return (await response.json()) as SearchItem[];
      });

      setItems(await request.current);
      setStatus('ready');
    } catch {
      request.current = null;
      setStatus('error');
    }
  }, []);

  const open = useCallback(() => {
    if (dialog.current?.open) return;

    dialog.current?.showModal();
    input.current?.focus();
    void load();
  }, [load]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const words = useMemo(
    () => normalize(query).trim().split(/\s+/).filter(Boolean),
    [query],
  );

  const matches = useMemo(() => {
    if (words.length === 0) {
      const projects = items
        .filter((item) => item.kind === 'つくったもの')
        .slice(0, 3);
      const docs = items
        .filter((item) => item.kind === 'ドキュメント')
        .slice(0, 4);
      const articles = items
        .filter((item) => item.kind === '技術記事')
        .slice(0, 3);
      return [...projects, ...docs, ...articles];
    }

    return items
      .map((item) => ({ item, score: scoreSearchItem(item, words) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(({ item }) => item);
  }, [items, words]);

  const safeActiveIndex =
    matches.length === 0 ? -1 : activeIndex >= matches.length ? 0 : activeIndex;

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (matches.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % matches.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + matches.length) % matches.length);
    } else if (event.key === 'Enter' && safeActiveIndex >= 0) {
      const target = matches[safeActiveIndex];
      if (target) {
        event.preventDefault();
        dialog.current?.close();
        window.location.assign(target.href);
      }
    }
  };

  const onTitleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (!('clientX' in e) || !('clientY' in e)) return;

    const box = e.currentTarget.getBoundingClientRect();
    const outside =
      e.clientX < box.left ||
      e.clientX > box.right ||
      e.clientY < box.top ||
      e.clientY > box.bottom;

    if (outside) dialog.current?.close();
  };

  return (
    <>
      <button
        ref={trigger}
        className="search-trigger"
        type="button"
        onClick={open}
        aria-label="サイト内を検索"
      >
        <span>検索</span>
        <kbd>⌘ K</kbd>
      </button>

      <dialog
        ref={dialog}
        className="search-dialog"
        aria-labelledby="search-title"
        onClose={() => trigger.current?.focus()}
        onClick={onTitleClick}
        onKeyDown={onTitleClick}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="search-title">サイト内を検索</h2>
          <button
            className="text-link"
            type="button"
            onClick={() => dialog.current?.close()}
          >
            閉じる
          </button>
        </div>

        <label className="sr-only" htmlFor="site-search">
          キーワード
        </label>

        <input
          ref={input}
          id="site-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onInputKeyDown}
          placeholder="記事、ライブラリ、つくったもの（↑↓で移動・Enterで開く）"
          autoComplete="off"
        />

        {status === 'loading' && <p role="status">読み込み中…</p>}

        {status === 'error' && (
          <p role="alert">
            検索データを取得できませんでした。
            <button
              className="text-link"
              type="button"
              onClick={() => void load()}
            >
              再試行
            </button>
          </p>
        )}

        {status === 'ready' && (
          <>
            <p className="search-caption" role="status">
              {query.trim()
                ? `${matches.length}件の候補`
                : 'つくったもの・導入ガイド・技術記事'}
            </p>

            <ul className="search-results">
              {matches.map((item, index) => (
                <li key={item.kind + item.href}>
                  <a
                    href={item.href}
                    data-active={index === safeActiveIndex ? 'true' : undefined}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => dialog.current?.close()}
                  >
                    <small>{item.kind}</small>
                    <strong>{item.title}</strong>
                    <span aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>

            {!matches.length && (
              <p className="py-6">別のキーワードで検索してみてください。</p>
            )}
          </>
        )}
      </dialog>
    </>
  );
}
