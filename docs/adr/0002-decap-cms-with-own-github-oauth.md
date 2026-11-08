# ADR-0002: Decap CMS と GitHub の認可開始ルート

- 状態: 採用
- 関連: `public/admin/config.yml`、`src/app/api/decap-oauth/auth/route.ts`

## 背景

記事をブラウザで編集し、Git で管理したい。管理画面は静的な入口として配信する。

## 決定

- `/admin` は `public/admin/index.html` に rewrite する。Decap CMS は GitHub バックエンドを使い、保存先は `main` とする。
- 認可開始ルートはランダムな `state` を Cookie に保存して GitHub にリダイレクトする。
- スコープは `public_repo` のみ。Cookie は HttpOnly・SameSite=Lax・パス限定・10 分の期限を持ち、HTTPS では Secure とする。
- 認可開始は IP ごとに 10 分で 10 回までに制限する。
- ローカルでは `npm run cms:proxy` と `local_backend: true` を使って編集する。

## 結果

ブラウザ編集でも Git に変更が残る。管理者をブランチ保護の対象から外し、CMS からの直接保存を許可する。

## 見直す条件

非公開リポジトリや複数の編集者に対応するときは権限と保存方法を見直す。
