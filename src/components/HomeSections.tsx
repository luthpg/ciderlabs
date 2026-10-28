import { site } from '../config/site';
import {
  docHref,
  type Library,
  type Project,
  projectDetailHref,
  type SiteContent,
} from '../lib/content';

export function Hero({
  counts,
}: {
  counts: Pick<SiteContent, 'projects' | 'articles' | 'libraries'>;
}) {
  return (
    <section className="hero">
      <div className="shell hero-grid">
        <div>
          <p className="eyebrow">BUILD. WRITE. SHARE.</p>

          <h1>
            小さな不便を、
            <br />
            <span className="sunset-mark">つくる楽しさ</span>に。
          </h1>

          <p className="lead">
            日々の「ちょっと困った」を、コードで心地よく。
            <br />
            GASとTypeScriptを中心に、Webアプリや開発者向けOSSをつくっています。
          </p>

          <div className="flex flex-wrap gap-3">
            <a className="button primary" href="#projects">
              つくったものを見る <span aria-hidden="true">↓</span>
            </a>
            <a className="button outline" href="#writing">
              技術記事を読む <span aria-hidden="true">↓</span>
            </a>
          </div>

          <p className="hero-note">GAS · TypeScript · React · Open Source</p>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="sun-disc" />

          <div className="code-window">
            <div className="window-bar">
              <span>● ● ●</span>
              <span>idea.ts</span>
            </div>
            <pre>
              <code>
                {'const idea = {\n' +
                  '  curiosity: true,\n' +
                  '  smallSteps: "every day",\n' +
                  '};\n\n' +
                  'build(idea)\n' +
                  '  .then(share)\n' +
                  '  .then(nextIdea);'}
              </code>
            </pre>
          </div>

          <div className="floating-card oss-card">
            <span>↗</span>
            <div>
              <strong>Open source</strong>
              <small>つくった道具を、みんなへ。</small>
            </div>
          </div>

          <div className="floating-card note-card">
            <span>✳</span>
            <div>
              <strong>Learn in public.</strong>
              <small>学びも、試行錯誤も。</small>
            </div>
          </div>
        </div>
      </div>

      <div className="shell stats">
        {[
          ['つくったもの', counts.projects.length, '#projects'],
          ['技術記事', counts.articles.length, '#writing'],
          ['ライブラリ', counts.libraries.length, '#libraries'],
        ].map(([label, count, href]) => (
          <a key={label} href={String(href)} className="stat-item">
            <strong>{String(count).padStart(2, '0')}</strong>
            <span>{label}</span>
          </a>
        ))}
        <p>
          小さくつくる。
          <br />
          少しずつ、よくする。
        </p>
      </div>
    </section>
  );
}

export function getProjectMeta(project: Project) {
  const parts = project.name.split(/\s+[-—–]\s+/);
  const shortName = parts[0]?.trim() || project.name;
  const subtitle = parts[1]?.trim() || project.category;
  const slugName =
    project.slug ??
    project.librarySlug ??
    shortName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  const identName =
    shortName
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr: string) => chr.toUpperCase())
      .replace(/^[^a-zA-Z]+/, '')
      .replace(/^[A-Z]/, (chr) => chr.toLowerCase()) || 'app';

  let host = `${slugName || 'app'}.ciderlabs.link`;
  if (project.url) {
    try {
      host = new URL(project.url).host;
    } catch {
      // ignore invalid url
    }
  }

  const tags = project.tags.length > 0 ? project.tags : [project.category];

  return {
    shortName,
    subtitle,
    slugName: slugName || 'app',
    identName,
    host,
    tags,
  };
}

export function ProjectVisual({
  project,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  const { visual } = project;
  const { shortName, subtitle, slugName, identName, host, tags } =
    getProjectMeta(project);
  const sizeClass = large ? 'featured-visual' : 'mini-visual';

  if (visual === 'poohma') {
    return (
      <div className="project-visual poohma-visual" aria-hidden="true">
        <div className="mock-app">
          <div className="mock-nav">
            <strong>
              {shortName}
              <span>●</span>
            </strong>
            <small>{subtitle}</small>
          </div>

          <p>家族でつかう、をひとつに。</p>

          <div className="mock-account">
            <i>W</i>
            <div>
              <b>おうちの Wi-Fi</b>
              <small>家族に共有 · ネットワーク</small>
            </div>
            <span>↗</span>
          </div>

          <div className="mock-account">
            <i>M</i>
            <div>
              <b>動画配信サービス</b>
              <small>家族に共有 · エンタメ</small>
            </div>
            <span>↗</span>
          </div>

          <div className="mock-safe">⌁ ヒントを暗号化して保存</div>
        </div>

        <span className="visual-badge">家族だけの、手がかり。</span>
      </div>
    );
  }

  if (visual === 'webapp' || visual === 'browser') {
    return (
      <div
        className={`project-visual ${sizeClass} surface-visual`}
        aria-hidden="true"
      >
        <div className="visual-frame">
          <div className="visual-frame-bar">
            <span className="visual-dots">● ● ●</span>
            <span className="visual-address">{host}</span>
            <span className="visual-pill">{project.category}</span>
          </div>
          <div className="visual-frame-body">
            <div className="visual-app-head">
              <strong>{shortName}</strong>
              <span className="visual-status">● Ready</span>
            </div>
            <div className="visual-chip-row">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="visual-chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'mobile' || visual === 'chat') {
    return (
      <div
        className={`project-visual ${sizeClass} surface-visual`}
        aria-hidden="true"
      >
        <div className="visual-frame">
          <div className="visual-frame-bar">
            <span className="visual-status">● {project.category}</span>
            <span className="visual-address">{shortName}</span>
          </div>
          <div className="visual-chat-list">
            <div className="visual-chat-bubble">
              <small>{tags[0] ?? project.category}</small>
              <b>{shortName}</b>
            </div>
            <div className="visual-chip-row">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="visual-chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'api') {
    return (
      <div
        className={`project-visual ${sizeClass} terminal-visual`}
        aria-hidden="true"
      >
        <div className="visual-api-bar">
          <span className="visual-method">POST</span>
          <code>/api/{slugName}</code>
          <span className="visual-ok">200 OK</span>
        </div>
        <code>
          <span>{`{ "service": "${shortName}",`}</span>
          <br />
          <span>{`  "stack": [${tags
            .slice(0, 2)
            .map((t) => `"${t}"`)
            .join(', ')}] }`}</span>
        </code>
      </div>
    );
  }

  if (visual === 'dashboard') {
    return (
      <div
        className={`project-visual ${sizeClass} surface-visual`}
        aria-hidden="true"
      >
        <div className="visual-frame">
          <div className="visual-frame-bar">
            <strong>{shortName}</strong>
            <span className="visual-pill">{project.category}</span>
          </div>
          <div className="visual-metrics">
            {tags.slice(0, 3).map((tag, index) => (
              <div key={tag} className="visual-metric">
                <small>{tag}</small>
                <span
                  className="visual-bar"
                  style={{ width: `${90 - index * 18}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'automation') {
    const steps = [tags[0] ?? 'Trigger', shortName, tags[1] ?? 'Complete'];
    return (
      <div
        className={`project-visual ${sizeClass} type-visual`}
        aria-hidden="true"
      >
        <small>{project.category.toUpperCase()} WORKFLOW</small>
        <div className="visual-flow">
          {steps.map((step, index) => (
            <div key={step} className="visual-flow-step">
              <span className="visual-flow-node">{step}</span>
              {index < steps.length - 1 && (
                <span className="visual-flow-arrow">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual === 'extension') {
    return (
      <div
        className={`project-visual ${sizeClass} surface-visual`}
        aria-hidden="true"
      >
        <div className="visual-frame">
          <div className="visual-frame-bar">
            <span className="visual-pill">🧩 Extension</span>
            <span className="visual-status">● Active</span>
          </div>
          <div className="visual-frame-body">
            <div className="visual-app-head">
              <strong>{shortName}</strong>
              <small>{project.category}</small>
            </div>
            <div className="visual-chip-row">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="visual-chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'security') {
    return (
      <div
        className={`project-visual ${sizeClass} surface-visual`}
        aria-hidden="true"
      >
        <div className="visual-frame">
          <div className="visual-frame-bar">
            <span className="visual-status">⌁ Protected</span>
            <span className="visual-pill">{project.category}</span>
          </div>
          <div className="visual-frame-body">
            <div className="visual-app-head">
              <strong>{shortName}</strong>
              <code>•••• ••••</code>
            </div>
            <div className="visual-chip-row">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="visual-chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'terminal') {
    const cmd = project.librarySlug
      ? `npx @ciderjs/${project.librarySlug}`
      : `run ${slugName} --${(tags[0] ?? 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return (
      <div
        className={`project-visual ${sizeClass} terminal-visual`}
        aria-hidden="true"
      >
        <code>
          <span>$ {cmd}</span>
          <br />✓ {tags[0] ?? project.category} ready
          <br />✓ {tags[1] ?? 'connected'} configured
          <br />
          <b>{shortName} is ready.</b>
        </code>
      </div>
    );
  }

  return (
    <div
      className={`project-visual ${sizeClass} type-visual`}
      aria-hidden="true"
    >
      <code>
        <small>
          {project.category.toUpperCase()} ·{' '}
          {tags.slice(0, 2).join(' / ').toUpperCase()}
        </small>
        <br />
        <b>{`const app = await ${identName}.create()`}</b>
        <br />
        <span>{subtitle}</span>
      </code>
    </div>
  );
}

function ProjectCard({
  project,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  const detailUrl = projectDetailHref(project);

  return (
    <article className={`project-card ${large ? 'featured' : ''}`}>
      <ProjectVisual project={project} large={large} />

      <div className="card-body">
        <p className="eyebrow">{project.category}</p>

        <h3>
          <a href={detailUrl}>{project.name}</a>
        </h3>

        <p className="whitespace-pre-line">{project.description}</p>

        <div className="tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className="card-links">
          <a href={detailUrl}>詳細を見る →</a>
          {project.librarySlug && (
            <a href={docHref(project.librarySlug)}>導入ガイド →</a>
          )}
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer">
              サイトを見る ↗
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects({ projects }: { projects: Project[] }) {
  const main = projects.find((project) => project.featured) ?? projects[0];

  return (
    <section id="projects" className="section shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">01 / PROJECTS</p>
          <h2>
            「あったらいいな」を、
            <wbr />
            つくりました。
          </h2>
        </div>
        <p>日々の困りごとから生まれた、アプリと開発ツール。</p>
      </div>

      {main && (
        <div className="projects-grid">
          <ProjectCard project={main} large />

          <div className="side-projects">
            {projects
              .filter((project) => project.id !== main.id)
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function Libraries({ libraries }: { libraries: Library[] }) {
  return (
    <section id="libraries" className="section shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">03 / OPEN SOURCE</p>
          <h2>
            開発が、
            <wbr />
            少し快適になる道具。
          </h2>
        </div>
        <p>自分のためにつくったものを、誰かにも使えるかたちで。</p>
      </div>

      <div className="library-grid">
        {libraries.map((library) => (
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

      {libraries.length > 0 && (
        <div className="docs-banner">
          <div>
            <p className="eyebrow">GET STARTED</p>
            <h3>
              「使ってみよう」を、
              <wbr />
              ここから。
            </h3>
            <p>
              インストールから最初の一歩まで、日本語の導入ガイドで解説しています。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {libraries.map((library, index) => (
              <a
                key={library.id}
                className={`button ${index === 0 ? 'primary' : 'outline'}`}
                href={docHref(library.slug)}
              >
                {library.name} の導入ガイド <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function About({
  projects = [],
  libraries = [],
}: {
  projects?: Project[];
  libraries?: Library[];
}) {
  return (
    <section id="about" className="about-section">
      <div className="shell about-grid">
        <div>
          <p className="eyebrow">BEHIND THE CODE</p>
          <h2>
            つくる人も、
            <br />
            学びの途中です。
          </h2>
        </div>

        <div>
          <p>{site.about}</p>
          <p className="mt-4">
            実際に自分で使いながら試行錯誤し、得られた知見をOSSや技術記事として公開する循環を大切にしています。
          </p>

          <dl className="about-highlights">
            {libraries.length > 0 && (
              <div>
                <dt>開発者向けOSS・ライブラリの提供</dt>
                <dd>
                  日々の開発体験を改善するツールやライブラリを設計し、
                  {libraries.map((lib, index) => (
                    <span key={lib.id}>
                      {index > 0 && '・'}
                      <a href={docHref(lib.slug)}>{lib.name}</a>
                    </span>
                  ))}{' '}
                  として公開しています。
                </dd>
              </div>
            )}
            {projects.length > 0 && (
              <div>
                <dt>日常の不便を解消するアプリケーション開発</dt>
                <dd>
                  安全性と使いやすさの両立を意識しながら、
                  {projects
                    .filter((proj) => !proj.librarySlug)
                    .map((proj, index) => {
                      const shortName =
                        proj.name.split(/\s+[-—–]\s+/)[0]?.trim() || proj.name;
                      return (
                        <span key={proj.id}>
                          {index > 0 && '・'}
                          <a href={projectDetailHref(proj)}>{shortName}</a>
                        </span>
                      );
                    })}{' '}
                  などの個人開発に取り組んでいます。
                </dd>
              </div>
            )}
            <div>
              <dt>活動サマリー・連絡先</dt>
              <dd>
                GitHub・Zenn・Qiita のアウトプットを集約した自動ポートフォリオは{' '}
                <a href={site.lapras} target="_blank" rel="noopener noreferrer">
                  LAPRAS ↗
                </a>
                、ご連絡や日々の発信は X（旧Twitter）の{' '}
                <a href={site.x} target="_blank" rel="noopener noreferrer">
                  {site.xHandle} ↗
                </a>{' '}
                からご覧いただけます。
              </dd>
            </div>
          </dl>

          <div className="about-sign">
            <strong>
              {site.author}
              <span> / developer</span>
            </strong>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
            <a href={site.zenn} target="_blank" rel="noopener noreferrer">
              Zenn ↗
            </a>
            <a href={site.qiita} target="_blank" rel="noopener noreferrer">
              Qiita ↗
            </a>
            <a href={site.lapras} target="_blank" rel="noopener noreferrer">
              LAPRAS ↗
            </a>
            <a href={site.x} target="_blank" rel="noopener noreferrer">
              X ({site.xHandle}) ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
