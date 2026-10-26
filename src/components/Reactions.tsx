import '../styles/articles.css';
import { type Article, formatDate } from '../lib/content';

export default function Reactions({
  article,
}: {
  article: Pick<Article, 'zennUrl' | 'qiitaUrl' | 'reactions'>;
}) {
  const sources = [
    {
      name: 'Zenn',
      url: article.zennUrl,
      value: article.reactions.zenn,
    },
    {
      name: 'Qiita',
      url: article.qiitaUrl,
      value: article.reactions.qiita,
    },
  ].filter((source) => source.url);

  if (!sources.length) return null;

  return (
    <fieldset
      className="platform-reactions"
      aria-label="外部サービスのリアクション"
    >
      {sources.map(({ name, url, value }) => (
        <div className="platform-reaction" key={name}>
          <a href={url}>
            <strong>{name} ↗</strong>
          </a>

          {value ? (
            <>
              <span>いいね {value.likes}</span>

              {value.stocks !== undefined && (
                <span>ストック {value.stocks}</span>
              )}

              <a href={url}>コメント {value.comments}</a>

              <small>
                取得{' '}
                <time dateTime={value.fetchedAt} title={value.fetchedAt}>
                  {formatDate(value.fetchedAt)}
                </time>
              </small>
            </>
          ) : (
            <small>件数は未取得</small>
          )}
        </div>
      ))}
    </fieldset>
  );
}
