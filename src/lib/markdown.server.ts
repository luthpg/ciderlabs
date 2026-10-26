import { load } from 'cheerio';
import markdownToHtml from 'zenn-markdown-html';

export async function renderMarkdown(markdown: string) {
  const html = await markdownToHtml(markdown, {
    embedOrigin: 'https://embed.zenn.studio',
  });

  const $ = load(html, {}, false);

  const used = new Set<string>();
  $('[id]').each((_, element) => {
    used.add($(element).attr('id')!);
  });

  const headings: {
    id: string;
    text: string;
    level: number;
  }[] = [];

  $('h2, h3').each((index, element) => {
    const heading = $(element);
    let id = heading.attr('id');

    if (!id) {
      id = `section-${index + 1}`;
      while (used.has(id)) id += '-';
      used.add(id);
      heading.attr('id', id);
    }

    headings.push({
      id,
      text: heading.text(),
      level: Number(element.tagName.slice(1)),
    });
  });

  $('a[target="_blank"]').attr('rel', 'noopener noreferrer');
  $('img').attr({ loading: 'lazy', decoding: 'async' });

  $('pre').each((_, element) => {
    if (!$(element).find('code').length) return;

    $(element).wrap('<div class="code-block"></div>');
    $(element).before(
      '<button type="button" class="copy-code" data-copy-code ' +
        'aria-label="コードをコピー">コピー</button>',
    );
  });

  return {
    html: $.html(),
    headings,
    hasEmbeds: $('iframe').length > 0,
    hasMath: $('embed-katex').length > 0,
  };
}
