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
