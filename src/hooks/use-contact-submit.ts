import { useState } from "react";
import type { ContactFormData } from "@/lib/contact/schema";
import {
  CONTACT_API_PATH,
  isContactSuccess,
  type ContactResponseBody,
} from "@/lib/contact/api-types";

export type SubmitStatus = "idle" | "sending" | "sent" | "error";

export function useContactSubmit() {
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function submit(data: ContactFormData) {
    setStatus("sending");
    try {
      const response = await fetch(CONTACT_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body: ContactResponseBody | null = await response.json().catch(() => null);
      if (!response.ok || !isContactSuccess(body)) throw new Error("failed");
      setStatus("sent");
    } catch (error) {
      console.error("[ContactForm] 送信に失敗しました:", error);
      setStatus("error");
    }
  }

  return { status, submit };
}
