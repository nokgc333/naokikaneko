"use client";

import { useState } from "react";
import { MdOutlineChatBubbleOutline, MdClose } from "react-icons/md";
import dynamic from "next/dynamic";

const loadContactForm = () => import("./contact-form");
const ContactForm = dynamic(loadContactForm);

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      aria-label="お問い合わせ"
      className={`fixed z-50 overflow-y-auto border border-border bg-background shadow-lg ${
        isOpen
          ? "inset-x-4 top-24 bottom-16 rounded-2xl p-6 sm:inset-x-auto sm:top-auto sm:right-8 sm:bottom-8 sm:h-[648px] sm:w-[486px]"
          : "right-8 bottom-8 h-16 w-16 rounded-full"
      }`}
    >
      {isOpen ? (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="pl-6 text-lg font-bold">Contact</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="閉じる"
              className="text-2xl"
            >
              <MdClose aria-hidden="true" />
            </button>
          </div>
          <ContactForm />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          onPointerEnter={loadContactForm}
          onFocus={loadContactForm}
          aria-label="お問い合わせを開く"
          className="flex h-16 w-16 items-center justify-center text-3xl"
        >
          <MdOutlineChatBubbleOutline aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
