import { type Project, projectSlug } from './content';

export interface ProjectHighlight {
  label: '課題' | '工夫' | '結果';
  text: string;
}

export interface ProjectDetailSpec {
  slug: string;
  userSummary: string;
  techSummary: string;
  problem: string;
  features: string[];
  highlights: ProjectHighlight[];
  relatedArticleSlugs: string[];
}

const PROJECT_SPECS: Record<string, Omit<ProjectDetailSpec, 'slug'>> = {
  poohma: {
    userSummary:
      '家族で使うサービスのログインIDやパスワードのヒントを、安全なグループ空間でまとめて共有できるWebアプリ。',
    techSummary:
      'サーバー側でも中身を読めないエンドツーエンド暗号化（E2EE）とパスキー認証（WebAuthn）を組み合わせ、手軽さと安全性を両立しています。',
    problem:
      '家族でWi-Fiや動画配信サービスなどのアカウントを共有するとき、LINEや紙のメモでパスワードそのものをやり取りするのは危ない一方、本格的なパスワードマネージャーを家族全員に導入してもらうのはハードルが高いという課題がありました。',
    features: [
      '家族グループを作成し、招待リンクからメンバーを参加させて共有アカウント一覧を管理',
      'パスワードそのものではなく「家族だけがわかるヒント」とログインID・URLを整理して保存',
      'パスキー（生体認証・端末ロック）によるログインで、複雑なマスターパスワードの暗記が不要',
    ],
    highlights: [
      {
        label: '課題',
        text: '運営者のサーバーやデータベースにも平文の認証情報を一切残さず、かつ家族がスマートフォンから迷わず使える体験にする必要がありました。',
      },
      {
        label: '工夫',
        text: 'Web Crypto API によるクライアントサイド暗号化（E2EE）と WebAuthn PRF 拡張を組み合わせ、端末の生体認証から暗号鍵を導出する構成を設計しました。',
      },
      {
        label: '結果',
        text: 'サーバー管理者にすらデータが復号できないゼロ知識構成を保ちながら、普段のログイン操作だけで家族間の情報共有ができるWebアプリとして公開しました。',
      },
    ],
    relatedArticleSlugs: ['e2ee-design-poohma'],
  },
  linkbox: {
    userSummary:
      'あとで読みたいWebページを、ブラウザやiOSショートカット・APIから素早く保存・検索できるブックマーク管理Webアプリ。',
    techSummary:
      'シンプルなREST APIとWeb UIを備え、スマートフォンやPCの垣根なく自分のリンク集へアクセスできます。',
    problem:
      'ブラウザの標準ブックマークや「あとで読む」サービスは端末やアプリごとに分散しやすく、iPhoneの共有シートや自作スクリプトからワンタップで集約できる軽量な受け皿が欲しかったのがきっかけです。',
    features: [
      'iOSショートカットや外部ツールからAPI経由でURLとタイトルを即座に登録',
      '保存したリンクの一覧表示・キーワード検索・タグ整理をシンプルなWeb画面で操作',
      '余計な装飾やSNS機能を省いた、個人利用に徹した軽快なレスポンス',
    ],
    highlights: [
      {
        label: '課題',
        text: '日常のブラウジングの流れを止めずに数秒でURLを保存できることと、あとから探しやすい一覧性を両立する必要がありました。',
      },
      {
        label: '工夫',
        text: 'Web画面からの操作だけでなくAPIエンドポイントを最初から用意し、iOSショートカットなどの外部自動化ツールと直結できる設計にしました。',
      },
      {
        label: '結果',
        text: 'スマートフォンで見つけた記事もPCで調べた技術資料も同じ場所に集まり、日々の情報収集の手間が減りました。',
      },
    ],
    relatedArticleSlugs: [],
  },
  'transit-line': {
    userSummary:
      '使い慣れたLINEのトーク画面から、現在地をもとに計算した帰宅時間を家族へワンタップで通知できるLIFFアプリ。',
    techSummary:
      'LINE Front-end Framework (LIFF) と位置情報・経路計算を連携し、専用アプリのインストール不要で使えるように設計しています。',
    problem:
      '仕事や外出からの帰り道に「あと何分くらいで着くか」を毎回マップアプリで調べてLINEに打ち込むのが手間で、ボタンを押すだけで現在地から帰宅目安を家族へ伝えられる仕組みをつくりました。',
    features: [
      'LINEのトークルーム内からLIFF画面を起動し、現在地から目的地までの所要時間を自動計算',
      '計算された到着予定時刻を整形したメッセージとして、そのままLINEトークへ送信',
      '家族側は新しいアプリを入れる必要がなく、普段のLINEの延長で使える導線',
    ],
    highlights: [
      {
        label: '課題',
        text: '移動中の片手操作でも迷わず使え、通知を受け取る家族にもアプリ導入の負担をかけないインターフェースが求められました。',
      },
      {
        label: '工夫',
        text: 'ネイティブアプリではなくLIFF（LINEミニアプリ基盤）を採用し、位置情報の取得からメッセージ送信までを最小限のタップ数で完結するフローに絞りました。',
      },
      {
        label: '結果',
        text: '毎回の「今から帰る・何時ごろ着く」の連絡が数秒で済むようになり、日常の小さな手間を解消できました。',
      },
    ],
    relatedArticleSlugs: [],
  },
  gasbombe: {
    userSummary:
      '対話型CLIで数問答えるだけで、テスト・バンドル・claspデプロイ設定済みのGAS × TypeScript開発環境を即座に構築できるジェネレータ。',
    techSummary:
      'esbuild / Vite・Vitest・Biome / ESLint・GitHub Actions などの定番構成をテンプレート化し、環境構築の手間をゼロにします。',
    problem:
      'Google Apps Script (GAS) をローカルのTypeScriptで開発しようとすると、毎回claspやバンドラ、型定義、テスト環境の組み合わせで時間を取られてしまう課題を解決するために開発しました。',
    features: [
      'CLIの質問に答えるだけで、用途（スタンドアロン / Webアプリ等）に合わせた構成を生成',
      'Vitestによるローカル単体テストや、リンター・フォーマッター設定を初期状態から同梱',
      'npm / pnpm / yarn / bun の各パッケージマネージャーに対応',
    ],
    highlights: [
      {
        label: '課題',
        text: 'GAS特有のグローバルスコープ制約やビルド設定を毎回手作業で組むのが煩雑で、本来書きたい業務ロジックになかなか着手できない問題がありました。',
      },
      {
        label: '工夫',
        text: '実践で培ったバンドル設定とディレクトリ構成をCLIテンプレートとして切り出し、コマンドひとつで再現できるようにしました。',
      },
      {
        label: '結果',
        text: '新しいGASプロジェクトを数十秒で立ち上げられるようになり、npmパッケージとして公開しています。',
      },
    ],
    relatedArticleSlugs: ['gasbombe-publish', 'use-vitest-gas-oss'],
  },
};

export function getProjectSpec(project: Project): ProjectDetailSpec {
  const slug = projectSlug(project);
  const preset = PROJECT_SPECS[slug];

  if (preset) {
    return {
      slug,
      ...preset,
    };
  }

  return {
    slug,
    userSummary: project.description,
    techSummary: `${project.category} として ${project.tags.join(' / ')} を用いて設計・実装しています。`,
    problem:
      '日々の作業や生活のなかで感じた「ちょっとした不便」を、手元ですぐに動かせる道具として形にしました。',
    features: [
      project.description,
      `主な技術要素: ${project.tags.join(' / ') || project.category}`,
    ],
    highlights: [
      {
        label: '課題',
        text: '日常的に使い続けられるシンプルさと、保守しやすい構成を両立することを目指しました。',
      },
      {
        label: '工夫',
        text: `${project.tags.slice(0, 3).join('・') || project.category} を組み合わせ、必要な機能に絞った軽快な動作を実現しています。`,
      },
      {
        label: '結果',
        text: '実際のユースケースで継続的に動かしながら、細かな使い勝手を改善しています。',
      },
    ],
    relatedArticleSlugs: [],
  };
}
