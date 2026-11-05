# ADR-0005: CSP の `script-src` に `'unsafe-inline'` を残す

- 状態: 採用（2026-10-25、計測のうえで決定）
- 関連: `src/lib/security/security-headers.ts`、`e2e/security.spec.ts`

## 背景

CSP の `script-src` から `'unsafe-inline'` を外すと、XSS への防御が強くなる。ただし、Next.js の静的ページには、起動処理と RSC のペイロードのインラインスクリプトが含まれる。これを許すには、nonce かハッシュが必要になる。

## 検討と計測（本番ビルド、ローカル）

| 方式 | 結果 |
|---|---|
| SRI（`experimental.sri`）+ `script-src 'self'` | **使えない。** インラインスクリプトが違反になり、ハイドレーションが壊れた（ボタンが効かない） |
| nonce（`proxy.ts` + ルートレイアウトの `await connection()`） | 違反 0 件で動作する。ただし全ページが動的レンダリングになり、`Cache-Control: no-store`。TTFB（中央値）は、トップ 1.4ms → 4.6ms、ブログ記事 1.4ms → 21.3ms（MDX を毎回コンパイル）。Vercel では、さらにサーバーレスの起動時間とエッジキャッシュの喪失が加わる |
| ハッシュ | インラインスクリプトの内容がページとビルドごとに変わり、静的な `headers()` では表現できない |

## 決定

`script-src 'self' 'unsafe-inline'` を維持する。

- このサイトは、作者本人のファイルとサニタイズ済みの MDX だけを配信し、ユーザー入力を HTML に反映しない。XSS の現実的な経路がなく、防御上の利益は小さい。
- 速さを見せる作品であり、静的配信（CDN キャッシュ）を失うコストが大きい。
- 他のディレクティブ（`default-src 'self'`、`object-src 'none'`、`frame-ancestors 'none'`、`base-uri 'self'`、`form-action 'self'`）は厳格なまま。

## 結果

- 良い: 静的配信と性能を保てる。
- 悪い: インラインスクリプトの注入に対する防御は、CSP では得られない（入力を HTML に反映しない設計と、サニタイズで守る）。
- 回帰の検出: 主要 5 ページで CSP 違反が出ないことを、E2E が検査する。

## 見直す条件

- ユーザー入力や外部コンテンツを HTML に反映する機能を足す。
- 第三者のスクリプトを読み込む。
- Vercel 上の実測で、動的レンダリングの TTFB が許容できると確認できる。
- Next.js が静的ページ向けのハッシュ方式の CSP に対応する。
