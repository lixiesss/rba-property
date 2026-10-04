
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";

export default async function NotFoundPage() {
  const { t, href } = await getI18n();
  return <main className="flex min-h-dvh items-center justify-center bg-ivory px-6"><div className="max-w-xl text-center"><p className="eyebrow">404</p><h1 className="display-serif mt-4 text-5xl text-espresso">{t("This property could not be found.")}</h1><p className="mt-5 text-muted">{t("It may no longer be published, or the address may have changed.")}</p><Link href={href("/properties")} className="button-primary mt-8">{t("Browse properties")}</Link></div></main>;
}
