import '../styles/articles.css';
import { type Article, formatDate } from '../lib/content';

export default function Reactions({
  article,
  showFetchedAt = false,
}: {
  article: Pick<Article, 'zennUrl' | 'qiitaUrl' | 'reactions'>;
  showFetchedAt?: boolean;
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
      {sources.map(({ name, url, value }) => {
        const hasLikes = value != null && value.likes > 0;
        const hasStocks =
          value != null && value.stocks !== undefined && value.stocks > 0;
        const hasComments = value != null && value.comments > 0;

        return (
          <div className="platform-reaction" key={name}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <strong>{name} ↗</strong>
            </a>

            {hasLikes && <span>いいね {value.likes}</span>}

            {hasStocks && <span>ストック {value.stocks}</span>}

            {hasComments && (
              <a href={url} target="_blank" rel="noopener noreferrer">
                コメント {value.comments}
              </a>
            )}

            {showFetchedAt && value?.fetchedAt && (
              <small>
                取得{' '}
                <time dateTime={value.fetchedAt} title={value.fetchedAt}>
                  {formatDate(value.fetchedAt)}
                </time>
              </small>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
