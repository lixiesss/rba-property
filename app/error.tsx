"use client";
import { useI18n } from "@/lib/i18n/client";


import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t, href } = useI18n();
  return <main className="flex min-h-dvh items-center justify-center bg-ivory px-6"><div className="max-w-xl text-center"><p className="eyebrow">{t("Temporarily unavailable")}</p><h1 className="display-serif mt-4 text-5xl text-espresso">{t("We could not load this page.")}</h1><p className="mt-5 text-muted">{t("Please try again. If the problem continues, contact the RBA team directly.")}</p><div className="mt-8 flex justify-center gap-3"><button onClick={reset} className="button-primary">{t("Try again")}</button><Link href={href("/")} className="button-secondary">{t("Return home")}</Link></div></div></main>;
}
