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
