import { useCallback, useEffect, useRef, useState } from 'react';
import { normalize, type SearchItem } from '../lib/content';

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

  const words = normalize(query).trim().split(/\s+/).filter(Boolean);

  const matches = items
    .filter((item) =>
      words.every((word) =>
        normalize(item.title + ' ' + item.keywords).includes(word),
      ),
    )
    .slice(0, 12);

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
          onChange={(event) => setQuery(event.target.value)}
          placeholder="記事、ライブラリ、つくったもの"
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
              {query ? `${matches.length}件の候補` : '記事とドキュメント'}
            </p>

            <ul className="search-results">
              {matches.map((item) => (
                <li key={item.kind + item.href}>
                  <a href={item.href} onClick={() => dialog.current?.close()}>
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
