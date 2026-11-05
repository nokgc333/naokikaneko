# Application

## 起動

- Node.js 24.15.0 以上と npm 11.19.1 を使用する。
- `nvm use` で `.nvmrc` の Node.js を選び、`npm ci` で依存を導入する。
- `npm run dev` の後、ブラウザで `http://localhost:3000` を開く。
- Work の見出しが表示される空のページを確認する。

## スクリプト

- `npm run dev`: 開発サーバー。
- `npm run build`: 本番ビルド。
- `npm start`: 本番サーバー。
- `npm run lint`: ESLint。
- `npm run type-check`: Next.js の型生成と TypeScript 検査。

## 静的検査

- `npm run format` で現存するファイルを整形する。
- `npm run lint`、`npm run type-check`、`npm run format:check`、`npm run build` の順に確認する。
- `npm start` の後、狭い画面と広い画面で Work の見出しと余白を確認する。
- 横スクロールや文字の欠けがないことを確認する。

## 初回 CI の確認

- main 向けの pull request と main の push で CI の Foundation Checks が動作する。
- クリーンな複製で `nvm use`、`npm install --global npm@11.19.1`、`npm ci` を実行する。
- `npm run lint`、`npm run format:check`、`npm run type-check`、`npm run build` を実行する。
- pull request の Foundation Checks の成功を確認してから、次の機能へ進む。
- ビルド失敗時は foundation-build-log を取得し、履歴を書き換えず後続コミットで修正する。

## 問い合わせ設定

- `.env.example` を参考に、実行環境へ変数を設定する。値をリポジトリや検査ログへ含めない。
- `RESEND_API_KEY`: メール送信サービスの API キー。
- `ADMIN_EMAIL`: 通知の宛先メールアドレス。
- `CONTACT_MAIL_FROM`: 通知の送信元。
- 問い合わせの入力スキーマとレスポンス型、機能別の環境変数検証を単体テストで確認できる。
- メール設定がなくても既存の一覧・記事・プロフィールは閲覧できる。
- OAuth 設定の変数名は `GITHUB_OAUTH_CLIENT_ID` と `GITHUB_OAUTH_CLIENT_SECRET`。

## コンテンツ編集

- `npm run cms:proxy` と `npm run dev` を別のターミナルで起動し、`/admin` を開いてローカル原稿を編集する。
- CMS の入力項目・カテゴリ・画像の配置は `CONTENT_GUIDE.md` を参照する。
- 公開環境では GitHub OAuth App の callback URL をサイトと同じ origin の `/api/decap-oauth/callback` に設定する。
- `GITHUB_OAUTH_CLIENT_ID` と `GITHUB_OAUTH_CLIENT_SECRET` をサーバー環境へ設定し、秘密の値をクライアントやログへ含めない。
- `/api/decap-oauth/auth` が認可を開始し、callback が state cookie を照合して認可コードを交換する。
- 編集後は `npm run content:check`、`npm run lint`、`npm run type-check`、`npm test`、`npm run build` を実行する。
- 認証境界と CMS 設定は単体テストで確認する。公開環境でのログインと保存は、OAuth 設定後にブラウザで確認する。
