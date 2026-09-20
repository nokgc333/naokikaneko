"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormData } from "@/lib/schemas/contact";

export default function ContactForm() {
  const [
    status,
    setStatus,
  ] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", message: "", honeypot: "" },
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 flex flex-col gap-4 rounded-md border-[length:1.25px] border-black p-6"
    >
      <div>
        <label htmlFor="name">個人・法人名</label>
        <input
          id="name"
          {...register("name")}
          className="mt-1 block w-full border border-border p-2"
        />
        <p className="mt-1 min-h-5 text-sm text-destructive">{errors.name?.message}</p>
      </div>
      <div>
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="mt-1 block w-full border border-border p-2"
        />
        <p className="mt-1 min-h-5 text-sm text-destructive">{errors.email?.message}</p>
      </div>
      <div>
        <label htmlFor="message">本文</label>
        <textarea
          id="message"
          {...register("message")}
          rows={5}
          className="mt-1 block w-full border border-border p-2"
        />
        <p className="mt-1 min-h-5 text-sm text-destructive">{errors.message?.message}</p>
      </div>
      <input
        type="text"
        {...register("honeypot")}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="self-start rounded-md bg-black px-4 py-2 text-white"
      >
        送信
      </button>
      <p className="min-h-5 text-sm text-destructive">
        {status === "error" ? "送信に失敗しました。時間をおいて再度お試しください。" : null}
      </p>
    </form>
  );
}
