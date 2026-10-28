# ciderlabs

個人開発のプロダクト、ZennとQiitaの技術記事、GASやTypeScript向けOSSライブラリの導入ガイドをまとめたポートフォリオサイト（`https://www.ciderlabs.link`）のリポジトリです。

## 技術スタック

- フレームワーク: Astro 7（Static Output） / React 19
- スタイリング: Tailwind CSS v4 / `zenn-content-css`
- コンテンツ管理:
  - 開発物・ライブラリ導入ガイド: microCMS
  - 技術記事: 外部Gitリポジトリ（Zenn / Qiita原稿）および `zenn-markdown-html`
- OGP画像生成: `satori` / `@resvg/resvg-js`
- リンター・フォーマッター: Biome
- ホスティング: Cloudflare Workers Static Assets（Wrangler）

## ディレクトリ構成

```text
/
├── .github/workflows/
│   └── deploy.yaml          # CIビルド・Cloudflareデプロイ定義
├── microcms/
│   ├── libraries.schema.json # microCMS「libraries」APIスキーマ定義
│   └── projects.schema.json  # microCMS「projects」APIスキーマ定義
├── public/                  # 静的配信アセット
├── scripts/
│   ├── prepare.ts           # 記事原稿の変換・画像抽出・リアクション取得のエントリーポイント
│   ├── source-index.ts      # 記事リポジトリのインデックス構築・メタデータ検証
│   ├── articles.ts          # MarkdownからHTMLへの変換とアセットハッシュ化
│   └── reactions.ts         # Zenn / Qiita APIからのリアクション数取得
└── src/
    ├── components/          # UIコンポーネント（検索、記事一覧、セクション表示など）
    ├── config/              # サイト基本設定・ナビゲーション定義
    ├── layouts/             # 共通レイアウト（テーマ切替・OGPメタタグ出力）
    ├── lib/                 # microCMS取得、記事読込、Zodスキーマ、動的OGP生成
    ├── pages/               # ページルーティングおよびOGP画像・検索インデックス生成
    ├── scripts/             # クライアントスクリプト（ダークモード切替、クリップボードコピー）
    └── styles/              # グローバルCSS・記事ページ用スタイル
```

## コマンド一覧

パッケージマネージャーには `pnpm` を使用します。

| コマンド                | 内容                                                                       |
| :---------------------- | :------------------------------------------------------------------------- |
| `pnpm install`          | 依存パッケージをインストールします                                         |
| `pnpm run dev`          | 記事データの同期とリアクション取得を実行したあと、開発サーバーを起動します |
| `pnpm run content:sync` | 記事リポジトリの原稿変換とZenn / Qiitaのリアクション取得のみを実行します   |
| `pnpm run typecheck`    | TypeScriptの型チェック（`tsc --noEmit`）を実行します                       |
| `pnpm run build`        | 型チェック、記事同期、静的サイトのビルド（OGP画像生成を含む）を実行します  |
| `pnpm run preview`      | ビルド済みの `dist/` をローカルでプレビューします                          |
| `pnpm run check`        | Biomeによるフォーマットとリントを実行します                                |
| `pnpm run deploy`       | Wrangler経由でCloudflareへデプロイします                                   |

## 環境変数とCI設定

### 1. ローカル開発環境（`.env`）

プロジェクト直下に `.env` を作成し、以下の変数を設定します。

```dotenv
MICROCMS_SERVICE_DOMAIN=your-service-domain
MICROCMS_API_KEY=your-api-key
CONTENT_DIR=./../zenn

# 任意設定
# QIITA_TOKEN=your-qiita-token
# PREVIOUS_REACTIONS_URL=https://www.ciderlabs.link/reactions.json
```

| 変数名                    | 必須 | 説明                                                                                      |
| :------------------------ | :--: | :---------------------------------------------------------------------------------------- |
| `MICROCMS_SERVICE_DOMAIN` | 必須 | microCMSのサービスドメイン（`.microcms.io` を除いた文字列）                               |
| `MICROCMS_API_KEY`        | 必須 | `projects` と `libraries` エンドポイントのGET権限を持つAPIキー                            |
| `CONTENT_DIR`             | 任意 | 記事原稿リポジトリの配置パス。未設定時は `./content-source` を参照します                  |
| `QIITA_TOKEN`             | 任意 | Qiita API v2のアクセストークン。設定すると認証済みのレート制限（1000回/時）が適用されます |
| `PREVIOUS_REACTIONS_URL`  | 任意 | 公開済みサイトの `reactions.json` のURL。ローカルキャッシュと統合する際に使用します       |

### 2. GitHub Actions（Secrets / Variables）

`.github/workflows/deploy.yaml` での自動ビルドとデプロイには、リポジトリの `Settings > Secrets and variables > Actions` で以下の設定が必要です。

#### Repository Secrets

| 名前                      |     必須     | 内容                                                                                                                                                  |
| :------------------------ | :----------: | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MICROCMS_SERVICE_DOMAIN` |     必須     | microCMSのサービスドメイン                                                                                                                            |
| `MICROCMS_API_KEY`        |     必須     | microCMSのAPIキー                                                                                                                                     |
| `CLOUDFLARE_ACCOUNT_ID`   |     必須     | デプロイ先CloudflareアカウントID                                                                                                                      |
| `CLOUDFLARE_API_TOKEN`    |     必須     | Cloudflare Workersのデプロイ権限を持つAPIトークン                                                                                                     |
| `CONTENT_READ_TOKEN`      | 条件付き必須 | 記事原稿リポジトリがプライベートの場合に必須。対象リポジトリにのみ `Contents: Read-only` 権限を付与したFine-grained Personal Access Tokenを設定します |
| `QIITA_TOKEN`             |     推奨     | 共有ランナーのIPレート制限（未認証時60回/時）を回避するためのQiitaアクセストークン                                                                    |

#### Repository Variables

| 名前                     | 必須 | 内容                                                                             |
| :----------------------- | :--: | :------------------------------------------------------------------------------- |
| `CONTENT_REPOSITORY`     | 必須 | 記事原稿リポジトリ名（例: `luthpg/zenn`）                                        |
| `CONTENT_REF`            | 任意 | 取得対象のブランチまたはタグ（未設定時は `main`）                                |
| `PREVIOUS_REACTIONS_URL` | 推奨 | 前回配信済みのリアクションURL（例: `https://www.ciderlabs.link/reactions.json`） |

## microCMSのスキーマ定義

`microcms/` ディレクトリに各APIのスキーマ定義ファイルを配置しています。

- `microcms/projects.schema.json`: 開発物一覧（`visual` フィールドのセレクト項目には `poohma`, `webapp`, `browser`, `mobile`, `chat`, `api`, `terminal`, `code`, `dashboard`, `automation`, `extension`, `security` を指定可能）
- `microcms/libraries.schema.json`: OSSライブラリのメタ情報および導入ガイド本文
