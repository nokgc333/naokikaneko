# ADR-0002: Decap CMS を使い、GitHub OAuth のログイン処理を自前のルートで持つ

- 状態: 採用（2026-09）、強化（2026-10）
- 関連: `public/admin/config.yml`、`src/app/api/decap-oauth/`

## 背景

記事をブラウザから編集したい。ただし、サイトは静的で、データベースを持たない。ログインの仕組みを、外部サービスの契約や追加の常駐サーバーなしで用意したい。

## 決定

- 管理画面は Decap CMS（`/admin/index.html`）。GitHub バックエンドで、保存すると対象リポジトリの `main` に直接コミットする。
- Decap が必要とする OAuth の中継（認可の開始とコールバック）を、Next.js の API ルートで実装する。
  - `GET /api/decap-oauth/auth`: ランダムな `state` を生成して Cookie に保存し、GitHub の認可画面へリダイレクトする。
  - `GET /api/decap-oauth/callback`: `state` を検証し、コードをトークンに交換して、`postMessage` で管理画面に渡す。
- 強化の内容（NK-06）:
  - 要求するスコープは `public_repo` のみ（リポジトリは公開で、書き込みはこれで足りる）。
  - `state` は定数時間で比較する（`lib/security/timing-safe.ts`）。Cookie は `HttpOnly`・`SameSite=Lax`・パスを限定・10 分で失効し、HTTPS では `Secure`。
  - 認可とコールバックの両方にレート制限（IP ごとに 10 分で 10 回。お問い合わせの枠とは別）。
  - トークンとクライアントシークレットはログに出さない（テストで保証）。`postMessage` は、受け取り側のオリジンを検証してから送る。

## 結果

- 良い: 追加の契約や常駐サーバーが要らない。ログインの全処理がこのリポジトリのテスト対象になる。CMS 経由でも Git の履歴が残る。
- 悪い: CMS の保存が `main` に直接入るため、`develop` が `main` より古くなる（大きな作業の前に `git pull origin main` を実行する運用で吸収）。CMS の設定にない frontmatter は、保存時に消える（`src/project/cms-config.test.ts` がずれを検出する）。
- 本番での確認は、GitHub への実際のログインに依存するため、自動テストでは代替できない。

## 検討した代替案

- Netlify Identity / Git Gateway: ホスティングを Netlify にする必要がある。
- 第三者の OAuth 中継サービス: 外部サービスへの依存と、トークンの経路が増える。
- CMS を使わず、Git だけで運用する: ブラウザからの編集ができない。

## 見直す条件

編集者が増える、または非公開リポジトリにする場合は、スコープを `repo` に広げる必要が出る。その時は、権限の範囲を再検討する。
