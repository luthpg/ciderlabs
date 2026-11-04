import { createClient } from 'microcms-js-sdk';
import { z } from 'zod';
import { getArticles } from './articles.server';
import { getValidProjectMarkdown, projectSlug } from './content';
import {
  librarySchema,
  projectSchema,
  type SiteContent,
} from './schema.server';

const PROJECT_MARKDOWN_FALLBACKS: Record<string, string> = {
  poohma: `## 背景と解決したかった課題

動画配信サービスや自宅のWi-Fiなど、家族で共有しているアカウントは日常のなかにいくつもあります。ただ、実際のパスワードをそのままLINEや共有メモで送り合うのはセキュリティ面で不安が残りますし、やり取りしたメッセージは後から探しにくくなりがちです。一方で、1PasswordやBitwardenのような本格的なパスワードマネージャーを家族全員の端末に導入してもらうにはハードルが高いという悩みがありました。

PoohMaは、この「安全に共有したいけれど、家族全員が迷わず使える手軽さも手放したくない」という課題を解消するために開発したWebアプリです。事前に家族グループを作成しておけば、登録したアカウント情報をワンタップでメンバー全員と共有できます。

## パスワード本体ではなく「ヒント」を暗号化する設計

PoohMaが扱うのはパスワードそのものではなく、家族だけが思い出せる「手がかりとしてのヒント」です。

| 項目 | 一般的なパスワードマネージャー | 共有メモアプリ | PoohMa |
| :--- | :--- | :--- | :--- |
| パスワード本体 | 保存する | 平文で保存できてしまう | 保存しない（ヒントのみ） |
| 家族への共有 | 製品やプランによる | 都度リンク共有が必要 | 事前グループでワンタップ共有 |
| 暗号化（E2EE） | 製品による | 製品による | クライアント側で暗号化 |
| 主な用途 | 個人の認証情報管理・自動入力 | テキスト全般の共有 | 家族共有アカウントの手がかり管理 |

家族共用のアカウントであれば、「いつもの犬の名前＋記念日」のようなヒントさえ共有できれば十分に思い出せるケースが大半です。最初からパスワード本体を預からない設計にすることで、万が一の際のリスクを根本から減らしています。

さらに、「誰の誕生日か」「どんな言葉を組み合わせているか」といったヒント自体も推測の手がかりになるため、保存するデータはすべてエンドツーエンド暗号化（E2EE）で保護しています。

## 主な機能と技術的な工夫

- **家族グループ単位での共有管理**：招待リンクから家族メンバーをグループに迎え入れ、サービス名・ログインID・URL・パスワードのヒントを一覧で整理できます。
- **Web Crypto API によるクライアントサイド暗号化**：共有テキストはブラウザ側で暗号化してからサーバーへ送信するため、データベースやサーバー管理者であっても平文の中身を読むことはできません。
- **WebAuthn（パスキー）による手軽なロック解除**：端末の生体認証や画面ロック（WebAuthn PRF拡張）から暗号鍵を導出する仕組みを取り入れ、複雑なマスターパスワードを別途暗記しなくても安全に復号できるようにしました。`,

  linkbox: `## 背景と解決したかった課題

日々見つけた技術記事やあとで読みたいWebページを保存するとき、ブラウザ標準のブックマークや既存の「あとで読む」サービスを使うと、PCとスマートフォン、あるいはアプリごとに保存先が分散してしまいがちでした。特にiPhoneのブラウザやSNSアプリから見つけた記事を、共有シート経由で素早く1か所に集約できる軽量な受け皿が欲しかったのが開発のきっかけです。

linkboxは、Web画面からの操作だけでなくAPI経由での登録を最初から前提として設計した、個人利用向けのブックマーク管理Webアプリです。

## 主な機能

- **API・iOSショートカットからの即座な登録**：REST APIエンドポイントを備えており、iOSの「ショートカット」アプリや自作スクリプトからURLとタイトルをワンタップで保存できます。
- **キーワード検索とタグによる整理**：保存したリンクを一覧で確認し、タイトル・URLの部分一致検索やタグによって目的のページをすぐに見つけ出せます。
- **個人利用に徹した軽快なUI**：SNS的な共有機能や過剰な装飾を省き、日常の情報収集の流れを止めないレスポンスの速さを重視しています。

## 設計・実装上の工夫

- **Web UIとAPIの二刀流構成**：Next.js（React・TypeScript）をベースに、ブラウザ上で完結する管理画面と、外部ツールからトークン認証で呼び出せるAPIルートを同じアプリケーション内に統合しました。
- **端末を選ばない収集フロー**：PCでの調べもの中はブラウザから直接追加し、移動中のスマートフォンからはiOSショートカットで共有シートから送信することで、どの端末で開いたページも同じリストに集まる体験を作っています。`,

  gasbombe: `## 背景と解決したかった課題

Google Apps Script（GAS）のローカル開発は \`@google/clasp\` の普及で一般的になりましたが、実際にTypeScriptやReact・Vueを使った開発環境を一から整えようとすると、毎回多くの設定作業が発生します。

- GASランタイムの制約に合わせたバンドラ（Rolldown / Vite）の選定と設定
- グローバル関数として認識させるためのビルド出力調整と \`tsconfig.json\` の構成
- \`@types/google-apps-script\` の導入や、ローカルで単体テストを回すためのVitest設定
- リンター・フォーマッター（Biome）やGitHub Actionsによる自動デプロイ構成

新しいGASツールを作りたいだけなのに、こうした環境構築だけで何時間も費やしてしまう課題を解決するため、コマンドひとつでベストプラクティス構成を展開できるCLIジェネレーター \`@ciderjs/gasbombe\` を開発しました。

## クイックスタート

パッケージを事前インストールすることなく、\`npx\`（または \`pnpm dlx\`）から対話モードですぐに実行できます。

\`\`\`bash
npx @ciderjs/gasbombe
\`\`\`

プロジェクト名、利用するパッケージマネージャー（\`npm\` / \`pnpm\` / \`yarn\`）、用途に応じたテンプレートを選択すると、初期設定済みのディレクトリが生成されます。

## 主な特徴と収録テンプレート

- **用途に応じたテンプレート選択**：サーバーサイド専用のTypeScript構成（\`server-ts\`, \`server-ciderjs\`）から、React・Vue 3を用いた単一HTMLバンドル構成（\`react-ciderjs\`, \`vue-ciderjs\`）まで幅広く対応しています。
- **CiderJSエコシステムとの統合**：サーバー・クライアント間を型安全につなぐ \`@ciderjs/gasnuki\`、GAS用ファイルベースルーター \`@ciderjs/city-gas\`、Vitest用モック \`@ciderjs/vitest-plugin-gas-mock\` などを最初から組み込んだ構成を選択できます。
- **テスト・CI/CD・AIエージェント対応**：ローカルでのVitest単体テスト、Biomeによるコードチェック、AIコーディングエージェント向けのルール定義ファイル（\`.agents\`）まで初期状態で同梱しています。

詳細なCLIオプションやプログラマティックAPIの仕様は、[導入ガイド（公式ドキュメント）](/docs/gasbombe/)を参照してください。`,
};

async function fetchContent(): Promise<SiteContent> {
  const env = z
    .object({
      domain: z.string().regex(/^[a-z0-9-]+$/),
      key: z.string().min(1),
    })
    .parse({
      domain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
      key: import.meta.env.MICROCMS_API_KEY,
    });

  const client = createClient({
    serviceDomain: env.domain,
    apiKey: env.key,
  });

  const [rawProjects, rawLibraries] = await Promise.all([
    client.getAllContents({
      endpoint: 'projects',
      queries: { orders: 'order' },
    }),
    client.getAllContents({
      endpoint: 'libraries',
      queries: { orders: 'order' },
    }),
  ]);

  const parsedProjects = z.array(projectSchema).parse(rawProjects);
  const libraries = z.array(librarySchema).parse(rawLibraries);
  const articles = getArticles();

  const librariesBySlug = new Map(
    libraries.map((library) => [library.slug, library]),
  );

  const projects = parsedProjects.map((project) => {
    const slug = projectSlug(project);
    const linkedLib = project.librarySlug
      ? librariesBySlug.get(project.librarySlug)
      : undefined;
    const validMarkdown =
      getValidProjectMarkdown(project.markdown) ??
      PROJECT_MARKDOWN_FALLBACKS[slug];

    return {
      ...project,
      repoUrl: project.repoUrl ?? linkedLib?.repoUrl,
      tags:
        project.tags.length > 0
          ? project.tags
          : linkedLib
            ? [linkedLib.category, 'TypeScript', 'CLI']
            : project.tags,
      markdown: validMarkdown,
    };
  });

  const projectSlugs = new Set(projects.map((project) => projectSlug(project)));

  if (projectSlugs.size !== projects.length) {
    throw new Error('プロジェクトのslugが重複しています');
  }

  const slugs = new Set(libraries.map((library) => library.slug));

  if (slugs.size !== libraries.length) {
    throw new Error('ライブラリのslugが重複しています');
  }

  if (projects.filter((project) => project.featured).length > 1) {
    throw new Error('featuredは1件までです');
  }

  for (const project of projects) {
    if (project.librarySlug && !slugs.has(project.librarySlug)) {
      throw new Error(`${project.name}: librarySlugの参照先がありません`);
    }
  }

  return { projects, articles, libraries };
}

let pending: Promise<SiteContent> | undefined;

export function getContent() {
  // 開発中はページ再読み込みでCMSの変更を取得する。
  if (import.meta.env.DEV) return fetchContent();

  // ビルド中は各ページで取得結果を共有する。
  pending ??= fetchContent();

  return pending;
}
