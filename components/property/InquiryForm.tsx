"use client";
import { useI18n } from "@/lib/i18n/client";


import { useState } from "react";

export function InquiryForm({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const { t, locale } = useI18n();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending"); setMessage("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, propertyId, source: "property_detail", locale }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || t("Unable to send inquiry"));
      form.reset(); setStatus("success"); setMessage(t("Thank you. The RBA team will be in touch shortly."));
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : t("Unable to send inquiry")); }
  }

  return <form onSubmit={submit} className="inquiry-form">
    <div><p className="eyebrow">{t("Enquire")}</p><h2 className="display-serif mt-3 text-4xl text-espresso">{t("Ask about")} {propertyTitle}</h2></div>
    <label><span>{t("Name")}</span><input name="name" autoComplete="name" required maxLength={120} /></label>
    <div className="grid gap-5 sm:grid-cols-2"><label><span>{t("Email")}</span><input name="email" type="email" autoComplete="email" maxLength={180} /></label><label><span>{t("Phone / WhatsApp")}</span><input name="phone" type="tel" autoComplete="tel" maxLength={80} /></label></div>
    <label><span>{t("Message")}</span><textarea name="message" required rows={5} maxLength={3000} defaultValue={`${t("I would like to know more about")} ${propertyTitle}.`} /></label>
    <input name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
    <button type="submit" className="button-primary justify-self-start" disabled={status === "sending"}>{status === "sending" ? t("Sending...") : t("Send inquiry")}</button>
    {message ? <p role="status" className={status === "error" ? "text-clay" : "text-teal"}>{message}</p> : null}
  </form>;
}
