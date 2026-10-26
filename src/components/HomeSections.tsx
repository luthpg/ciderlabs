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

function ProjectVisual({ visual }: { visual: Project['visual'] }) {
  if (visual === 'poohma') {
    return (
      <div className="project-visual poohma-visual" aria-hidden="true">
        <div className="mock-app">
          <div className="mock-nav">
            <strong>
              PoohMa<span>●</span>
            </strong>
            <small>わが家のアカウント</small>
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

  return (
    <div
      className={
        'project-visual mini-visual ' +
        (visual === 'terminal' ? 'terminal-visual' : 'type-visual')
      }
      aria-hidden="true"
    >
      {visual === 'terminal' ? (
        <code>
          <span>$ npx @ciderjs/gasbombe</span>
          <br />✓ template ready
          <br />✓ clasp configured
          <br />
          <b>Let’s build something.</b>
        </code>
      ) : (
        <code>
          <small>TYPE-SAFE GAS</small>
          <br />
          <b>const result = await gas.hello()</b>
          <br />
          <span>型がつながる。開発が進む。</span>
        </code>
      )}
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
    <article className={'project-card ' + (large ? 'featured' : '')}>
      <ProjectVisual visual={project.visual} />

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
                aria-label={library.name + 'のインストールコマンドをコピー'}
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
