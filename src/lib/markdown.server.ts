import { load } from 'cheerio';
import markdownToHtml from 'zenn-markdown-html';

interface LangMeta {
  key: string;
  ext: string;
  label: string;
}

const LANG_MAP: Record<string, LangMeta> = {
  ts: { key: 'ts', ext: '.ts', label: 'TypeScript' },
  typescript: { key: 'ts', ext: '.ts', label: 'TypeScript' },
  tsx: { key: 'tsx', ext: '.tsx', label: 'TSX' },
  js: { key: 'js', ext: '.js', label: 'JavaScript' },
  javascript: { key: 'js', ext: '.js', label: 'JavaScript' },
  jsx: { key: 'jsx', ext: '.jsx', label: 'JSX' },
  gs: { key: 'gs', ext: '.gs', label: 'Google Apps Script' },
  gas: { key: 'gs', ext: '.gs', label: 'Google Apps Script' },
  vue: { key: 'vue', ext: '.vue', label: 'Vue' },
  json: { key: 'json', ext: '.json', label: 'JSON' },
  jsonc: { key: 'json', ext: '.jsonc', label: 'JSON' },
  bash: { key: 'sh', ext: '.sh', label: 'Bash' },
  sh: { key: 'sh', ext: '.sh', label: 'Shell' },
  shell: { key: 'sh', ext: '.sh', label: 'Shell' },
  zsh: { key: 'sh', ext: '.zsh', label: 'Zsh' },
  console: { key: 'sh', ext: '.sh', label: 'Terminal' },
  yaml: { key: 'yaml', ext: '.yaml', label: 'YAML' },
  yml: { key: 'yaml', ext: '.yml', label: 'YAML' },
  html: { key: 'html', ext: '.html', label: 'HTML' },
  css: { key: 'css', ext: '.css', label: 'CSS' },
  scss: { key: 'css', ext: '.scss', label: 'SCSS' },
  md: { key: 'md', ext: '.md', label: 'Markdown' },
  markdown: { key: 'md', ext: '.md', label: 'Markdown' },
  diff: { key: 'diff', ext: '.diff', label: 'Diff' },
  sql: { key: 'sql', ext: '.sql', label: 'SQL' },
  toml: { key: 'toml', ext: '.toml', label: 'TOML' },
  text: { key: 'txt', ext: '.txt', label: 'Text' },
  txt: { key: 'txt', ext: '.txt', label: 'Text' },
  plaintext: { key: 'txt', ext: '.txt', label: 'Text' },
  '': { key: 'txt', ext: '.txt', label: 'Text' },
};

const EXT_KEY_ALIAS: Record<string, string> = {
  ts: 'ts',
  mts: 'ts',
  cts: 'ts',
  tsx: 'tsx',
  js: 'js',
  mjs: 'js',
  cjs: 'js',
  jsx: 'jsx',
  gs: 'gs',
  vue: 'vue',
  json: 'json',
  jsonc: 'json',
  sh: 'sh',
  bash: 'sh',
  zsh: 'sh',
  yaml: 'yaml',
  yml: 'yaml',
  html: 'html',
  css: 'css',
  scss: 'css',
  md: 'md',
  sql: 'sql',
  toml: 'toml',
  diff: 'diff',
  txt: 'txt',
};

const FILE_ICON_SVG =
  '<svg class="code-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>' +
  '<path d="M14 2v4a2 2 0 0 0 2 2h4"></path>' +
  '</svg>';

const COPY_ICON_SVG =
  '<svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>' +
  '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>' +
  '</svg>';

const CHECK_ICON_SVG =
  '<svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M20 6 9 17l-5-5"></path>' +
  '</svg>';

function parseFenceAtLine(
  lines: string[],
  dataLine: number | undefined,
): { lang: string; filename: string } {
  if (dataLine === undefined || !Number.isFinite(dataLine)) {
    return { lang: '', filename: '' };
  }

  for (const offset of [0, -1, 1, -2, 2]) {
    const candidate = lines[dataLine + offset];
    if (candidate === undefined) continue;

    const match = /^\s*(?:`{3,}|~{3,})([^\s:`~]*)(?::(.+))?$/.exec(candidate);
    if (match) {
      return {
        lang: (match[1] ?? '').trim().toLowerCase(),
        filename: (match[2] ?? '').trim(),
      };
    }
  }

  return { lang: '', filename: '' };
}

export async function renderMarkdown(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const html = await markdownToHtml(markdown, {
    embedOrigin: 'https://embed.zenn.studio',
  });

  const $ = load(html, {}, false);

  const used = new Set<string>();
  $('[id]').each((_, element) => {
    const id = $(element).attr('id');
    if (id) used.add(id);
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

  $('span.zenn-embedded').each((_, element) => {
    const container = $(element);
    const iframe = container.find('iframe[data-content]').first();
    const encoded = iframe.attr('data-content');
    if (!encoded) return;

    let decoded = '';
    try {
      decoded = decodeURIComponent(encoded).trim();
    } catch {
      return;
    }

    if (!/^https?:\/\//i.test(decoded)) return;

    let label = decoded;
    try {
      const parsed = new URL(decoded);
      label = `${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`;
      if (label.length > 64) {
        label = `${label.slice(0, 63)}…`;
      }
    } catch {
      // keep raw URL
    }

    const fallback = $('<a class="embed-fallback-link"></a>')
      .attr('href', decoded)
      .attr('target', '_blank')
      .attr('rel', 'noopener noreferrer')
      .text(`↗ 外部リンクを開く (${label})`);

    container.append(fallback);
  });

  $('pre').each((_, element) => {
    const pre = $(element);
    const code = pre.find('code').first();
    if (!code.length) return;

    const container = pre.closest('.code-block-container');
    const existingFilenameNode = container
      .find('.code-block-filename-container')
      .first();
    const domFilename = existingFilenameNode
      .find('.code-block-filename')
      .text()
      .trim();

    if (existingFilenameNode.length) {
      existingFilenameNode.remove();
    }

    const dataLineAttr = code.attr('data-line');
    const dataLine =
      dataLineAttr !== undefined ? Number(dataLineAttr) : undefined;
    const fence = parseFenceAtLine(lines, dataLine);

    let firstLineFilename = '';
    const firstLineText = code.find('.line').first().text().trim();
    const commentFileMatch =
      /^(?:\/\/|#)\s*([a-zA-Z0-9_./@-]+\.[a-zA-Z0-9]+(?:\s+.+)?)$/.exec(
        firstLineText,
      );
    if (commentFileMatch?.[1]) {
      firstLineFilename = commentFileMatch[1].trim();
    }

    const rawFilename = domFilename || fence.filename || firstLineFilename;
    const langMeta = LANG_MAP[fence.lang] ?? {
      key: fence.lang || 'txt',
      ext: fence.lang ? `.${fence.lang}` : '.txt',
      label: fence.lang ? fence.lang.toUpperCase() : 'Text',
    };

    let filenameText = '';
    let extBadge = langMeta.ext;
    let extKey = langMeta.key;
    let noteText = '';

    if (rawFilename) {
      const fileMatch =
        /^([a-zA-Z0-9_./@-]+\.([a-zA-Z0-9]+))(?:\s+(.+))?$/.exec(rawFilename);
      if (fileMatch) {
        filenameText = fileMatch[1] ?? rawFilename;
        const parsedExt = (fileMatch[2] ?? '').toLowerCase();
        extBadge = `.${parsedExt}`;
        extKey = EXT_KEY_ALIAS[parsedExt] ?? parsedExt;
        noteText = (fileMatch[3] ?? '').trim();
      } else {
        filenameText = rawFilename;
      }
    }

    pre.wrap(
      filenameText
        ? '<div class="code-block has-filename"></div>'
        : '<div class="code-block"></div>',
    );
    const codeBlock = pre.parent();

    if (filenameText) {
      const filenameBar = $(
        '<div class="code-block-filename-container"></div>',
      );
      const filenameInner = $('<span class="code-block-filename"></span>');
      filenameInner.append(FILE_ICON_SVG);
      filenameInner.append(
        $('<span class="code-block-filename-text"></span>').text(filenameText),
      );
      if (noteText) {
        filenameInner.append(
          $('<span class="code-block-note"></span>').text(noteText),
        );
      }
      filenameBar.append(filenameInner);
      codeBlock.before(filenameBar);
    }

    const toolbar = $('<div class="code-block-toolbar"></div>');
    if (extBadge) {
      toolbar.append(
        $('<span class="code-block-ext"></span>')
          .attr('data-ext', extKey)
          .text(extBadge),
      );
    }

    const copyBtn = $(
      '<button type="button" class="copy-code" data-copy-code aria-label="コードをコピー">' +
        COPY_ICON_SVG +
        CHECK_ICON_SVG +
        '<span class="copy-label">コピー</span>' +
        '</button>',
    );
    toolbar.append(copyBtn);

    pre.before(toolbar);
  });

  return {
    html: $.html(),
    headings,
    hasEmbeds: $('iframe').length > 0,
    hasMath: $('embed-katex').length > 0,
  };
}
