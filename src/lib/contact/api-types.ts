export const CONTACT_API_PATH = "/api/contact";

export type ContactFieldErrors = {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
};

export type ContactSuccessBody = { ok: true };
export type ContactErrorBody = { error: string | ContactFieldErrors };
export type ContactResponseBody = ContactSuccessBody | ContactErrorBody;

export const CONTACT_ERROR_MESSAGES = {
  rateLimited: "リクエストが多すぎます。時間をおいて再度お試しください",
  bodyTooLarge: "送信内容が大きすぎます",
  malformed: "リクエストの形式が正しくありません",
  sendFailed: "メール送信に失敗しました",
} as const;

export function isContactSuccess(body: unknown): body is ContactSuccessBody {
  return typeof body === "object" && body !== null && (body as { ok?: unknown }).ok === true;
}
