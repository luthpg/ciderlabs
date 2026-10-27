import { site } from '../config/site';
import {
  docHref,
  type Library,
  type Project,
  projectHref,
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
            個人開発と技術の記録を、ここから。
          </p>

          <div className="flex flex-wrap gap-3">
            <a className="button primary" href="#projects">
              つくったものを見る <span>↗</span>
            </a>
            <a className="button outline" href="#writing">
              技術記事を読む <span>→</span>
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
          ['つくったもの', counts.projects.length],
          ['技術記事', counts.articles.length],
          ['ライブラリ', counts.libraries.length],
        ].map(([label, count]) => (
          <div key={label}>
            <strong>{String(count).padStart(2, '0')}</strong>
            <span>{label}</span>
          </div>
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

function getProjectMeta(project: Project) {
  const parts = project.name.split(/\s+[-—–]\s+/);
  const shortName = parts[0]?.trim() || project.name;
  const subtitle = parts[1]?.trim() || project.category;
  const slugName =
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

function ProjectVisual({
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
  return (
    <article className={`project-card ${large ? 'featured' : ''}`}>
      <ProjectVisual project={project} large={large} />

      <div className="card-body">
        <p className="eyebrow">{project.category}</p>

        <h3>
          <a href={projectHref(project)}>
            {project.name} <span aria-hidden="true">↗</span>
          </a>
        </h3>

        <p>{project.description}</p>

        <div className="tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className="card-links">
          <a href={projectHref(project)}>
            {project.librarySlug ? 'ドキュメント' : 'サイトを見る'} →
          </a>
          {project.repoUrl && <a href={project.repoUrl}>GitHub ↗</a>}
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
          <h2>「あったらいいな」を、つくりました。</h2>
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
          <h2>開発が、少し快適になる道具。</h2>
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
                data-copy={library.command}
                aria-label={`${library.name}のインストールコマンドをコピー`}
              >
                コピー
              </button>
            </div>

            <div className="card-links">
              <a href={docHref(library.slug)}>導入ガイド →</a>
              <a href={library.repoUrl}>GitHub ↗</a>
              <a href={library.npmUrl}>npm ↗</a>
            </div>
          </article>
        ))}
      </div>

      {libraries[0] && (
        <div className="docs-banner">
          <div>
            <p className="eyebrow">GET STARTED</p>
            <h3>「使ってみよう」を、ここから。</h3>
            <p>インストールから最初の一歩まで、日本語のガイドで。</p>
          </div>
          <a className="button primary" href={docHref(libraries[0].slug)}>
            ドキュメントを読む →
          </a>
        </div>
      )}
    </section>
  );
}

export function About() {
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
            使って、試して、気づいたことを共有する。
            そんな循環を大切にしています。
          </p>

          <div className="about-sign">
            <strong>
              {site.author}
              <span> / developer</span>
            </strong>
            <a href={site.github}>GitHub ↗</a>
            <a href={site.zenn}>Zenn ↗</a>
          </div>
        </div>
      </div>
    </section>
  );
}
