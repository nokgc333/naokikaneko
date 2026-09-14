# お問い合わせ機能（Plan 3） Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Topページの「Contact」セクションに問い合わせフォームを実装し、送信内容をZodで検証した上でResend経由で管理者宛に通知メールを送る。

**Architecture:** クライアント側は`react-hook-form` + `zodResolver`でフォーム状態・検証を管理するClient Component。送信は`/api/contact`（Route Handler）にPOSTし、サーバー側でも同じZodスキーマで再検証（クライアント側の検証はUX目的であり、信頼しない）。検証を通過したら`Resend` SDKで管理者（`ADMIN_EMAIL`）宛にメールを送信する。スパム対策として、画面上は見えないハニーポットフィールドを設け、値が入っていた場合は実際の送信をせず成功したふりをして応答する（Bot側に「弾かれた」と気づかせない）。

**Tech Stack:** Next.js(App Router, Route Handler) / react-hook-form / @hookform/resolvers / zod / resend

**Spec:** `docs/superpowers/specs/2026-09-09-portfolio-card-site-design.md`

## Global Constraints

- 環境変数名は`RESEND_API_KEY`, `ADMIN_EMAIL`（my-webと同じ名称、一貫性のため）
- 送信元アドレスはResendのサンドボックス送信元 `onboarding@resend.dev` を使用（独自ドメイン未認証のため）
- 今回は管理者宛の通知メールのみ実装する（送信者への自動返信は将来対応、スコープ外）
- サーバー側APIでも必ずZodで再検証する。クライアント側の検証だけを信頼しない
- ハニーポットフィールドが埋まっていた場合、実際のメール送信は行わずに200 OKを返す（Bot対策の手の内を明かさない）
- git関連コマンドはすべてユーザー自身が実行する

---

## File Structure

```
naokikaneko/
├── src/
│   ├── lib/
│   │   └── schemas/
│   │       └── contact.ts          # Zodスキーマ（name/email/message/honeypot）
│   ├── components/
│   │   ├── contact-form.tsx        # フォーム本体（Client Component）
│   │   └── contact-form.test.tsx
│   └── app/
│       ├── page.tsx                # Contactセクションに<ContactForm />を追加
│       └── api/
│           └── contact/
│               ├── route.ts        # POSTハンドラ
│               └── route.test.ts
└── .env.local                      # RESEND_API_KEY, ADMIN_EMAILを追記（ユーザーが管理）
```

---

### Task 1: Zodスキーマ

**Files:**
- Create: `src/lib/schemas/contact.ts`

**Interfaces:**
- Consumes: なし
- Produces: `contactFormSchema`（Zodスキーマ）、`ContactFormData`型。`honeypot`フィールドを含む

- [ ] **Step 1: スキーマを作成する**

`src/lib/schemas/contact.ts`:

```ts
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "お名前を入力してください").max(100),
  email: z.string().email("有効なメールアドレスを入力してください"),
  message: z.string().min(1, "本文を入力してください").max(2000),
  honeypot: z.string().max(0, "").optional().default(""),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
```

- [ ] **Step 2: ビルドで型エラーがないことを確認する**

Run:
```bash
cd /Users/naokikaneko/dev/naokikaneko && npm run type-check
```

Expected: エラーなし

- [ ] **Step 3: ユーザーが実行するコマンド**

```bash
git add -A
git commit -m "feat: add contact form zod schema"
```

---

### Task 2: `/api/contact` Route Handler

**Files:**
- Create: `src/app/api/contact/route.ts`, `src/app/api/contact/route.test.ts`
- Test: `src/app/api/contact/route.test.ts`

**Interfaces:**
- Consumes: `contactFormSchema`（Task 1）、環境変数`RESEND_API_KEY`, `ADMIN_EMAIL`
- Produces: `POST /api/contact` — 成功時200、バリデーションエラー時422、Resend送信失敗時500

- [ ] **Step 1: resendパッケージをインストールする**

Run:
```bash
npm install resend
```

- [ ] **Step 2: 失敗するテストを書く**

`src/app/api/contact/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

const sendMock = vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null });

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    sendMock.mockClear();
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
  });

  it("正しい入力の場合、Resendでメールを送信し200を返す", async () => {
    const response = await POST(
      makeRequest({ name: "Taro", email: "taro@example.com", message: "Hello" })
    );

    expect(response.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const callArgs = sendMock.mock.calls[0][0];
    expect(callArgs.to).toBe("admin@example.com");
    expect(callArgs.replyTo).toBe("taro@example.com");
  });

  it("nameが空の場合、422を返しメールを送信しない", async () => {
    const response = await POST(
      makeRequest({ name: "", email: "taro@example.com", message: "Hello" })
    );

    expect(response.status).toBe(422);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("emailが不正な形式の場合、422を返す", async () => {
    const response = await POST(
      makeRequest({ name: "Taro", email: "not-an-email", message: "Hello" })
    );

    expect(response.status).toBe(422);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("honeypotに値が入っている場合、200を返すがメールは送信しない", async () => {
    const response = await POST(
      makeRequest({
        name: "Bot",
        email: "bot@example.com",
        message: "spam",
        honeypot: "filled",
      })
    );

    expect(response.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: テストが失敗することを確認する**

Run:
```bash
npx vitest run src/app/api/contact/route.test.ts
```

Expected: FAIL（`./route`が存在しないため）

- [ ] **Step 4: 実装する**

`src/app/api/contact/route.ts`:

```ts
import { Resend } from "resend";
import { contactFormSchema } from "@/lib/schemas/contact";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { name, email, message, honeypot } = parsed.data;

  if (honeypot) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_EMAIL;

  const { error } = await resend.emails.send({
    from: "お問い合わせ <onboarding@resend.dev>",
    to: adminEmail ?? "",
    replyTo: email,
    subject: `【お問い合わせ】${name}様より`,
    text: `お名前: ${name}\nメールアドレス: ${email}\n\n${message}`,
  });

  if (error) {
    return Response.json({ error: "メール送信に失敗しました" }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
```

- [ ] **Step 5: テストが通ることを確認する**

Run:
```bash
npx vitest run src/app/api/contact/route.test.ts
```

Expected: PASS（4件）

- [ ] **Step 6: ユーザーが実行するコマンド**

```bash
git add -A
git commit -m "feat: add /api/contact route handler with honeypot spam protection"
```

---

### Task 3: フォームUI（Client Component）

**Files:**
- Create: `src/components/contact-form.tsx`, `src/components/contact-form.test.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `contactFormSchema`（Task 1）、`POST /api/contact`（Task 2）
- Produces: `<ContactForm />`（`src/components/contact-form.tsx`のdefault export）。Topページの`Contact`セクションから呼び出される

- [ ] **Step 1: react-hook-form・@hookform/resolversをインストールする**

Run:
```bash
npm install react-hook-form @hookform/resolvers
```

- [ ] **Step 2: 失敗するテストを書く**

`src/components/contact-form.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContactForm from "./contact-form";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    );
  });

  it("必須項目が空のまま送信するとエラーメッセージを表示する", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(await screen.findByText("お名前を入力してください")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("正しく入力して送信すると成功メッセージを表示する", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("お名前"), "Taro");
    await user.type(screen.getByLabelText("メールアドレス"), "taro@example.com");
    await user.type(screen.getByLabelText("本文"), "Hello");
    await user.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(screen.getByText("送信しました")).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({ method: "POST" })
    );
  });
});
```

- [ ] **Step 3: テスト実行に必要な`@testing-library/user-event`をインストールする**

Run:
```bash
npm install -D @testing-library/user-event
```

- [ ] **Step 4: テストが失敗することを確認する**

Run:
```bash
npx vitest run src/components/contact-form.test.tsx
```

Expected: FAIL

- [ ] **Step 5: 実装する**

`src/components/contact-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormData } from "@/lib/schemas/contact";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p>送信しました</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
      <div>
        <label htmlFor="name">お名前</label>
        <input id="name" {...register("name")} className="mt-1 block w-full border border-border p-2" />
        {errors.name ? <p className="mt-1 text-sm text-destructive">{errors.name.message}</p> : null}
      </div>
      <div>
        <label htmlFor="email">メールアドレス</label>
        <input id="email" type="email" {...register("email")} className="mt-1 block w-full border border-border p-2" />
        {errors.email ? <p className="mt-1 text-sm text-destructive">{errors.email.message}</p> : null}
      </div>
      <div>
        <label htmlFor="message">本文</label>
        <textarea id="message" {...register("message")} rows={5} className="mt-1 block w-full border border-border p-2" />
        {errors.message ? <p className="mt-1 text-sm text-destructive">{errors.message.message}</p> : null}
      </div>
      <input type="text" {...register("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" disabled={status === "sending"} className="self-start border border-border px-4 py-2">
        送信
      </button>
      {status === "error" ? <p className="text-sm text-destructive">送信に失敗しました。時間をおいて再度お試しください。</p> : null}
    </form>
  );
}
```

- [ ] **Step 6: テストが通ることを確認する**

Run:
```bash
npx vitest run src/components/contact-form.test.tsx
```

Expected: PASS（2件）

- [ ] **Step 7: Topページに組み込む**

`src/app/page.tsx`の`Contact`セクションを以下に変更する（既存の`<h2>Contact</h2>`のみの状態から差し替え）:

```tsx
import ContactForm from "@/components/contact-form";

// ...

<section>
  <h2 className="text-2xl font-bold" lang="en">
    Contact
  </h2>
  <ContactForm />
</section>
```

- [ ] **Step 8: ビルド・lint・型チェックを確認する**

Run:
```bash
npm run build && npm run lint && npm run type-check
```

Expected: すべて成功

- [ ] **Step 9: ユーザーが実行するコマンド**

```bash
git add -A
git commit -m "feat: add contact form UI to top page"
```

---

### Task 4: 環境変数の設定（ユーザー作業）

**Files:** なし（Vercelダッシュボード側の作業）

- [ ] **Step 1: ローカル`.env.local`に追記する**

```
RESEND_API_KEY=（my-webで使用中のキー）
ADMIN_EMAIL=（通知を受け取りたいメールアドレス）
```

- [ ] **Step 2: Vercelの環境変数にも追加する**

Vercelダッシュボード → Settings → Environment Variables:
- `RESEND_API_KEY`（Type: Secret）
- `ADMIN_EMAIL`（Type: Config）

- [ ] **Step 3: 再デプロイして本番で動作確認する**

本番URLの`/`にアクセスし、Contactフォームから実際に送信してメールが届くか確認する。

---

## Self-Review

- **Spec coverage**: 仕様書の「Zod検証 + Resend送信の`/api/contact`実装」「問い合わせフォームUI実装」をTask 1〜4でカバー
- **Placeholder scan**: 「TBD」等の記載なし
- **Type consistency**: `ContactFormData`型・`contactFormSchema`をTask間で統一。`honeypot`フィールド名も一貫
- **セキュリティ**: サーバー側で必ずZod再検証、ハニーポットでBot対策、`ADMIN_EMAIL`は`Secret`ではなく`Config`（メールアドレス自体は機密情報ではない）、`RESEND_API_KEY`は`Secret`
