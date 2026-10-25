"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormData } from "@/lib/contact/schema";
import { useContactSubmit } from "@/hooks/use-contact-submit";
import ContactField from "@/components/contact-field";

export default function ContactForm() {
  const { status, submit } = useContactSubmit();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", message: "", honeypot: "" },
  });

  if (status === "sent") {
    return (
      <p role="status" className="mt-7 pl-6">
        送信しました
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mt-4 flex flex-col gap-4 rounded-md border-[length:1.25px] border-black p-6"
    >
      <ContactField
        id="name"
        label="個人・法人名"
        registration={register("name")}
        error={errors.name?.message}
      />
      <ContactField
        id="email"
        label="メールアドレス"
        type="email"
        registration={register("email")}
        error={errors.email?.message}
      />
      <ContactField
        id="message"
        label="本文"
        rows={5}
        registration={register("message")}
        error={errors.message?.message}
      />
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
      <p role="alert" className="min-h-5 text-sm text-destructive">
        {status === "error" ? "送信に失敗しました。時間をおいて再度お試しください。" : null}
      </p>
    </form>
  );
}
