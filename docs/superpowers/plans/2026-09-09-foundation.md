# 基盤構築（Plan 1） Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js + TypeScript + Tailwind/shadcn/daisyUI + Decap CMS + テスト基盤（Vitest/Playwright）+ CIが揃った、空のページが1枚デプロイ可能な状態を作る。

**Architecture:** `create-next-app`でNext.js(App Router)をスキャフォールドし、その上にshadcn/ui・daisyUIを重ねる。コンテンツ管理はDecap CMSを`/admin`に静的配置し、ローカル開発は`decap-server`のローカルバックエンド、本番はGitHub OAuth（自前のAPI Routeでプロキシ実装）で認証する。テストはmy-webと同じVitest+Playwright構成を踏襲する。

**Tech Stack:** Next.js(App Router) / TypeScript(strict) / Tailwind CSS v4 / shadcn/ui(new-york) / daisyUI / Decap CMS / Vitest / Playwright / npm

**Spec:** `docs/superpowers/specs/2026-09-09-portfolio-card-site-design.md`

## Global Constraints

- パッケージマネージャは npm を使う（my-web踏襲、`package-lock.json`をコミット対象にする）
- TypeScriptは strict mode（`tsconfig.json`は my-web と同じ設定値を使う）
- ESLintは flat config（`eslint.config.mjs`）、`next/core-web-vitals` + `next/typescript` を継承する
- Tailwind CSS は v4系（`@tailwindcss/postcss`経由、`tailwind.config`ファイルは持たずCSS内`@theme`で完結させる）
- shadcn/ui は `style: "new-york"`, `baseColor: "zinc"`, `cssVariables: true`、パスエイリアスは `@/*` → `./src/*`
- Vitestは `environment: 'node'`、テストファイルは `**/*.test.ts(x)?` にマッチさせる
- Playwrightは Chromium のみ、`testDir: './e2e'`
- **git関連コマンド（`git init`/`git add`/`git commit`/`git push`/GitHub上でのリポジトリ作成やOAuth App作成など）はすべてユーザー自身が実行する。** 各タスクの最後に「ユーザーが実行するコマンド」として明記し、Claude(実装者)は絶対に`git`コマンドを実行しない
- 実装対象ディレクトリ: `/Users/naokikaneko/dev/naokikaneko`

---

## File Structure

```
naokikaneko/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ルートレイアウト（フォント・グローバルCSS読込）
│   │   ├── page.tsx            # プレースホルダーTopページ（Plan 2で本実装に置換）
│   │   ├── globals.css         # Tailwind + shadcn CSS変数
│   │   └── api/
│   │       └── decap-oauth/
│   │           ├── auth/route.ts      # GitHub OAuth認可リダイレクト
│   │           └── callback/route.ts  # GitHub OAuthコールバック（トークン交換）
│   ├── components/
│   │   └── ui/                 # shadcn/ui生成コンポーネント置き場
│   └── lib/
│       └── utils.ts            # shadcnの`cn()`ヘルパー
├── public/
│   └── admin/
│       ├── index.html          # Decap CMSエントリーポイント
│       └── config.yml          # Decap CMS設定（Plan 1では最小構成）
├── e2e/
│   └── home.spec.ts            # トップページ表示のE2Eテスト
├── vitest.config.ts
├── vitest.setup.ts
├── playwright.config.ts
├── eslint.config.mjs
├── components.json             # shadcn/ui設定
├── .github/workflows/ci.yml
└── docs/superpowers/           # 既存（spec/plan格納場所、そのまま維持）
```

---

### Task 1: Next.js プロジェクトスキャフォールド

**Files:**
- Create: プロジェクト全体（`create-next-app`が生成する標準ファイル一式）

**Interfaces:**
- Consumes: なし（最初のタスク）
- Produces: `package.json`（npm scripts: `dev`/`build`/`start`/`lint`）、`src/app/layout.tsx`、`src/app/page.tsx`、`tsconfig.json`、`eslint.config.mjs`

- [ ] **Step 1: 既存の`docs/`を退避する**

`create-next-app`は対象ディレクトリが空でないと警告を出すため、一時的に退避する。

Run:
```bash
mv /Users/naokikaneko/dev/naokikaneko/docs /private/tmp/claude-501/-/2f8059e9-a902-464f-96c5-2a76b57f77ec/scratchpad/naokikaneko-docs-backup
```

- [ ] **Step 2: create-next-appを実行する**

Run:
```bash
npx create-next-app@latest /Users/naokikaneko/dev/naokikaneko \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --yes
```

Expected: コマンドが正常終了し、`package.json`・`src/app/`・`tsconfig.json`等が生成される

- [ ] **Step 3: 退避した`docs/`を戻す**

Run:
```bash
mv /private/tmp/claude-501/-/2f8059e9-a902-464f-96c5-2a76b57f77ec/scratchpad/naokikaneko-docs-backup /Users/naokikaneko/dev/naokikaneko/docs
```

- [ ] **Step 4: tsconfig.jsonをmy-webの設定値に揃える**

`/Users/naokikaneko/dev/naokikaneko/tsconfig.json`の`compilerOptions`を以下に置き換える（`noImplicitAny: false`を明示追加、他はcreate-next-appの生成値を踏襲）:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "next.config.js"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: 開発サーバーが起動することを確認する**

Run:
```bash
cd /Users/naokikaneko/dev/naokikaneko && npm run build
```

Expected: ビルドが成功する（`✓ Compiled successfully`）

- [ ] **Step 6: ユーザーが実行するコマンド（git init・初回コミット）**

以降のタスクでは触れないので、ここで案内する。ユーザー自身が以下を実行する:

```bash
cd /Users/naokikaneko/dev/naokikaneko
git init
git add -A
git commit -m "chore: Next.jsプロジェクトを初期化"
```

---

### Task 2: shadcn/ui + daisyUI 導入

**Files:**
- Create: `components.json`, `src/lib/utils.ts`
- Modify: `src/app/globals.css`, `package.json`

**Interfaces:**
- Consumes: Task 1で生成された `src/app/`, `tsconfig.json`のパスエイリアス`@/*`
- Produces: `cn()`ヘルパー（`@/lib/utils`からexport、shadcnコンポーネントが内部で使用）、daisyUIのCSSクラス（`btn`, `card`等）がTailwindユーティリティと併用可能になる

- [ ] **Step 1: shadcn/ui初期化コマンドを実行する**

Run:
```bash
cd /Users/naokikaneko/dev/naokikaneko && npx shadcn@latest init -d --base-color zinc
```

Expected: `components.json`が生成され、`src/lib/utils.ts`に`cn()`が追加され、`src/app/globals.css`にCSS変数が追記される

- [ ] **Step 2: components.jsonの値を確認・調整する**

`/Users/naokikaneko/dev/naokikaneko/components.json`が以下の値になっていることを確認する（異なる場合は修正）:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
```

- [ ] **Step 3: daisyUIをインストールする**

Run:
```bash
npm install -D daisyui@latest
```

- [ ] **Step 4: globals.cssにdaisyUIプラグインを追加する**

`src/app/globals.css`の先頭付近（`@import "tailwindcss";`の直後）に以下を追加する:

```css
@plugin "daisyui" {
  themes: light --default;
}
```

- [ ] **Step 5: shadcnコンポーネントとdaisyUIが共存することをテストページで確認する**

`src/app/page.tsx`を一時的に以下へ書き換えて確認する:

```tsx
export default function Home() {
  return (
    <main className="p-8">
      <button className="btn btn-primary">daisyUI button</button>
      <p className="mt-4 text-zinc-900">shadcn base color test</p>
    </main>
  );
}
```

Run:
```bash
npm run build
```

Expected: ビルドが成功し、`.next`にdaisyUIのクラス（`btn`, `btn-primary`）が含まれる（`grep -r "btn-primary" .next/static | head -1`で確認できれば成功）

- [ ] **Step 6: ユーザーが実行するコマンド**

```bash
cd /Users/naokikaneko/dev/naokikaneko
git add -A
git commit -m "chore: shadcn/ui・daisyUIを導入"
```

---

### Task 3: 共通レイアウト・プレースホルダーTopページ + ユニットテスト

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/app/page.test.tsx`, `vitest.config.ts`, `vitest.setup.ts`

**Interfaces:**
- Consumes: `src/lib/utils.ts`の`cn()`（Task 2）
- Produces: `<Home />`コンポーネント（`src/app/page.tsx`のdefault export）。Plan 2で本実装に置き換える前提の、見出し`naokikaneko`を含むプレースホルダー

- [ ] **Step 1: Vitest関連パッケージをインストールする**

Run:
```bash
npm install -D vitest @vitejs/plugin-react @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: vitest.config.tsを作成する**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.test.ts(x)?', '**/*.test.ts(x)?'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts(x)?'],
      exclude: ['src/**/__tests__/**', 'src/**/*.test.ts(x)?', 'src/types/**', 'src/**/__mocks__/**'],
    },
  },
});
```

- [ ] **Step 3: vitest.setup.tsを作成する**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: package.jsonにテストスクリプトを追加する**

`package.json`の`scripts`に以下を追加する:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"type-check": "tsc --noEmit"
```

- [ ] **Step 5: 失敗するテストを書く**

`src/app/page.test.tsx`を作成:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home', () => {
  it('見出しに "naokikaneko" が表示される', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: 'naokikaneko' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: テストが失敗することを確認する**

Run:
```bash
npx vitest run src/app/page.test.tsx
```

Expected: FAIL（`page.tsx`にまだ"naokikaneko"の見出しがないため）

- [ ] **Step 7: page.tsxを実装する**

`src/app/page.tsx`を以下に置き換える:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">naokikaneko</h1>
    </main>
  );
}
```

- [ ] **Step 8: テストが通ることを確認する**

Run:
```bash
npx vitest run src/app/page.test.tsx
```

Expected: PASS

- [ ] **Step 9: ユーザーが実行するコマンド**

```bash
cd /Users/naokikaneko/dev/naokikaneko
git add -A
git commit -m "feat: プレースホルダーTopページとVitest基盤を追加"
```

---

### Task 4: Decap CMS 導入（ローカルバックエンドで動作確認）

**Files:**
- Create: `public/admin/index.html`, `public/admin/config.yml`

**Interfaces:**
- Consumes: なし
- Produces: `/admin`パスでDecap CMS管理画面が起動する。`public/admin/config.yml`の`backend`設定は Task 5 でGitHub本番設定に拡張する前提

- [ ] **Step 1: decap-serverをdevDependenciesに追加する**

Run:
```bash
npm install -D decap-server
```

- [ ] **Step 2: public/admin/index.htmlを作成する**

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager</title>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </body>
</html>
```

- [ ] **Step 3: public/admin/config.ymlを作成する（Plan 1では最小構成）**

```yaml
backend:
  name: github
  repo: naokikaneko/naokikaneko
  branch: main
  base_url: https://naokikaneko-xxx.vercel.app
  auth_endpoint: api/decap-oauth/auth

local_backend: true

media_folder: "public/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: "placeholder"
    label: "Placeholder"
    folder: "content/placeholder"
    create: true
    fields:
      - { name: "title", label: "Title", widget: "string" }
```

> `repo`と`base_url`はTask 6でGitHubリポジトリ作成・Vercelデプロイ後に実際の値へ更新する（現時点ではダミー値でOK。`local_backend: true`によりローカル動作確認はGitHubの値に依存しない）

- [ ] **Step 4: package.jsonにdecap-server起動スクリプトを追加する**

`package.json`の`scripts`に追加:

```json
"cms:proxy": "decap-server"
```

- [ ] **Step 5: ローカルでDecap CMSが起動することを確認する**

ターミナルを2つ使う手動確認手順（Claudeはこの確認結果をユーザーに報告してもらう）:

Run (ターミナル1):
```bash
cd /Users/naokikaneko/dev/naokikaneko && npm run cms:proxy
```

Run (ターミナル2):
```bash
cd /Users/naokikaneko/dev/naokikaneko && npm run dev
```

ブラウザで `http://localhost:3000/admin` を開き、"Placeholder"コレクションの編集画面が表示されることを確認する。

Expected: Decap CMSのUIが表示され、エラーが出ない

- [ ] **Step 6: ユーザーが実行するコマンド**

```bash
cd /Users/naokikaneko/dev/naokikaneko
git add -A
git commit -m "feat: Decap CMSをローカルバックエンドで導入"
```

---

### Task 5: GitHub OAuthプロキシ実装（本番用認証）

**Files:**
- Create: `src/app/api/decap-oauth/auth/route.ts`, `src/app/api/decap-oauth/callback/route.ts`
- Test: `src/app/api/decap-oauth/auth/route.test.ts`

**Interfaces:**
- Consumes: 環境変数 `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`
- Produces: `GET /api/decap-oauth/auth` — GitHub認可画面へリダイレクト。`GET /api/decap-oauth/callback` — Decap CMS側に`postMessage`でアクセストークンを渡すHTMLを返す

- [ ] **Step 1: 失敗するテストを書く（authエンドポイントのリダイレクト先検証）**

`src/app/api/decap-oauth/auth/route.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

describe('GET /api/decap-oauth/auth', () => {
  it('GitHubの認可URLへリダイレクトする', async () => {
    vi.stubEnv('GITHUB_OAUTH_CLIENT_ID', 'test-client-id');
    const request = new Request('http://localhost:3000/api/decap-oauth/auth');
    const response = await GET(request);
    expect(response.status).toBe(302);
    const location = response.headers.get('location');
    expect(location).toContain('https://github.com/login/oauth/authorize');
    expect(location).toContain('client_id=test-client-id');
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

Run:
```bash
npx vitest run src/app/api/decap-oauth/auth/route.test.ts
```

Expected: FAIL（`route.ts`が存在しないため import エラー）

- [ ] **Step 3: authエンドポイントを実装する**

`src/app/api/decap-oauth/auth/route.ts`:

```ts
export async function GET(request: Request) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/decap-oauth/callback`;

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId ?? '');
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'repo,user');

  return Response.redirect(authorizeUrl.toString(), 302);
}
```

- [ ] **Step 4: テストが通ることを確認する**

Run:
```bash
npx vitest run src/app/api/decap-oauth/auth/route.test.ts
```

Expected: PASS

- [ ] **Step 5: callbackエンドポイントを実装する（テストなし・外部API呼び出しのため統合確認は手動）**

`src/app/api/decap-oauth/callback/route.ts`:

```ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const { access_token: accessToken, error } = await tokenResponse.json();

  if (error || !accessToken) {
    return new Response(`OAuth error: ${error ?? 'unknown'}`, { status: 400 });
  }

  const message = JSON.stringify({ token: accessToken, provider: 'github' });

  const html = `
    <!doctype html>
    <html><body>
    <script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify(message)}',
            e.origin
          );
          window.removeEventListener('message', receiveMessage, false);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>
    </body></html>
  `;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
```

- [ ] **Step 6: 環境変数をローカル用に設定する**

`.env.local`に以下を追加する（値は Task 6 でユーザーがGitHub OAuth Appを作成した後に埋める。現時点ではダミー値でOK）:

```
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
```

- [ ] **Step 7: ビルドが通ることを確認する**

Run:
```bash
npm run build
```

Expected: 成功

- [ ] **Step 8: ユーザーが実行するコマンド**

```bash
cd /Users/naokikaneko/dev/naokikaneko
git add -A
git commit -m "feat: Decap CMS用GitHub OAuthプロキシを実装"
```

---

### Task 6: GitHub Actions CI設定

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `npm run lint`, `npm run type-check`, `npm run test`, `npm run test:e2e`（すべて既存タスクで定義済み）
- Produces: push/PR時に自動実行されるCIパイプライン

- [ ] **Step 1: Playwrightを導入する**

Run:
```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 2: playwright.config.tsを作成する**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

- [ ] **Step 3: e2e/home.spec.tsを作成する**

```ts
import { test, expect } from '@playwright/test';

test('トップページに見出しが表示される', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'naokikaneko' })).toBeVisible();
});
```

- [ ] **Step 4: package.jsonにe2eスクリプトを追加する**

```json
"test:e2e": "playwright test"
```

- [ ] **Step 5: ローカルでE2Eテストが通ることを確認する**

Run:
```bash
npm run test:e2e
```

Expected: PASS

- [ ] **Step 6: .github/workflows/ci.ymlを作成する**

```yaml
name: CI

on:
  push:
    branches: [main, 'feature/**']
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:coverage

  e2e:
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

- [ ] **Step 7: ユーザーが実行するコマンド**

```bash
cd /Users/naokikaneko/dev/naokikaneko
git add -A
git commit -m "ci: GitHub ActionsによるCIパイプラインを追加"
```

---

## Plan完了後のユーザー作業（GitHub/Vercel側の手動セットアップ）

以下はコード変更を伴わないため、タスクには含めていない。Plan 1完了後にユーザー自身が実施する:

1. GitHub上に新規リポジトリ `naokikaneko` を作成し、ローカルリポジトリをpush
   ```bash
   git remote add origin git@github.com:<your-account>/naokikaneko.git
   git push -u origin main
   ```
2. Vercelで新規プロジェクトとしてこのリポジトリをインポートし、デプロイ
3. GitHub Settings → Developer settings → OAuth Apps で新規OAuth Appを作成
   - Homepage URL: デプロイ後のVercel URL
   - Authorization callback URL: `https://<vercel-url>/api/decap-oauth/callback`
4. 発行された Client ID / Client Secret を Vercel の環境変数 `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` に設定
5. `public/admin/config.yml` の `repo` と `base_url` を実際の値に更新し、コミット・push

---

## Self-Review

- **Spec coverage**: Next.js/TS/Tailwind/shadcn/daisyUI(済) / Decap CMS導入(済) / GitHub OAuth連携(済) / Vitest・Playwright・CI(済) を各タスクでカバー。Work/Blogページ・Contact機能はPlan 2/3に委譲（意図通り）
- **Placeholder scan**: 「TBD」等の記載なし。config.ymlのダミー値は明示的にダミーである理由と更新手順(Plan完了後の手動セットアップ)を記載済み
- **Type consistency**: `Home`コンポーネント名、`cn()`、環境変数名(`GITHUB_OAUTH_CLIENT_ID`/`GITHUB_OAUTH_CLIENT_SECRET`)はTask間で一致させた
