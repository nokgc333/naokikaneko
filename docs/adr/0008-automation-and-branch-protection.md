# ADR-0008: 依存の自動更新・pre-commit・ブランチ保護の方針

- 状態: 採用（2026-10-25）
- 関連: `.github/dependabot.yml`、`.husky/pre-commit`、`.lintstagedrc.json`、`.secretlintrc.json`、`.github/branch-protection/`

## 背景

依存の更新を人が思い出して行う運用では、脆弱性への対応が遅れる。秘密情報のコミットや、整形・lint の漏れは、CI で気づいても履歴に残ってしまう。また、`main` は本番に直結しており、誤った push や force push を機械的に防ぎたい。ただし、CMS（Decap）は編集者のトークンで `main` に直接コミットするため、保護が CMS の保存を妨げてはならない。

## 決定

### 依存の自動更新（Dependabot）

- npm と GitHub Actions を、毎週月曜に確認する。npm は、minor と patch を 1 つの PR にまとめる（PR の数を抑える）。
- 上位の制約で更新できない 4 つの major（`@hookform/resolvers`、`eslint`、`typescript`、`@types/node`）は、major の提案を無視する。理由は `docs/TASKLIST.md` の NK-20 に記録している（`@types/node` は、実行環境の Node 24 に合わせるため）。
- PR は CI（性能予算・監査・Dependency Review・CodeQL を含む）が通ってからマージする。

### 脆弱な推移的依存（`overrides`）

- 親パッケージが古い版に固定していて、Dependabot のセキュリティ更新が PR を作れないときは、`package.json` の `overrides` で、**親を限定して**修正版へ上げる（全体への上書きはしない。別の用途の、別のメジャー版を巻き込むため）。
- 現在: `@lhci/cli` 配下の `tmp`（0.2.6 以上）と `uuid`（11.1.1 以上）、`@tailwindcss/typography` 配下の `postcss-selector-parser`（6.1.5 以上）。いずれも開発依存で、本番の依存には入らない。
- 上げたあとは、Lint・型・単体・build・E2E と、`lhci collect` の動作を確かめる。親が修正版に追随したら、`overrides` を外す。
- **修正版が存在しないもの**（`deepmerge`・`@hapi/joi`・`extract-zip`）は、上げられない。いずれも開発依存で、親（`shadcn`・`decap-server`・`lighthouse`）の対応を待つ。

### コミット前の検査（husky + lint-staged + secretlint）

- コミット時に、ステージされたファイルだけを検査する: TypeScript は ESLint と Prettier、JSON・CSS・YAML は Prettier、**すべてのファイルに secretlint**（API キー・トークンなどの秘密情報の検出）。
- 秘密情報の検出は、npm で完結する secretlint を選んだ（`gitleaks` は別途インストールが必要で、再現性が下がるため）。GitHub 側のシークレットスキャン・プッシュ保護、GitGuardian が、サーバー側の二重の備えになる。
- `npm install` / `npm ci` の `prepare` が husky を有効にする。CI でも害はない。

### ブランチ保護

- `main`: 必須のステータスチェック（Lint、Type Check、Unit & Integration Tests、E2E Tests、Performance Budget、Dependency Audit、CodeQL）、force push と削除を禁止。
- `develop`: force push と削除の禁止だけ。作業ブランチなので、チェックは要求しない。
- **管理者は保護の対象外**（`enforce_admins: false`）。CMS は、管理者である編集者のトークンで `main` に直接コミットする。PR 必須やチェック必須を管理者にも強制すると、CMS の保存が失敗する。
- 設定は `.github/branch-protection/*.json` にバージョン管理し、`gh api` で適用する（手順は README）。

## 結果

- 良い: 脆弱性への対応が定期的に PR として届く。秘密情報と整形の漏れを、コミット時点で止められる。force push を防げる。
- 悪い: 管理者は保護をすり抜けられる（CMS の運用との両立のため）。`prepare` で husky が入る。Dependabot の PR が増える（グループ化で抑える）。
- 保護の設定そのものは、GitHub の設定変更であり、リポジトリ管理者が手元で実行する。

## 検討した代替案

- Renovate: 設定の自由度は高いが、GitHub App の導入が必要。Dependabot は標準機能で足りる。
- CMS を `editorial_workflow`（PR 経由）にして、管理者にも保護を強制する: 保存のたびに PR が立ち、運用が重くなる。

## 見直す条件

編集者が増える、または CMS を PR 経由にする場合は、`enforce_admins` を有効にし、PR を必須にする。
