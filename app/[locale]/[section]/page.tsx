import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrandStory } from "@/components/home/BrandStory";
import { FaqPreview } from "@/components/home/FaqPreview";
import { ContactCTA } from "@/components/home/ContactCTA";
import { getI18n } from "@/lib/i18n/server";
import { localeMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const { locale, t } = await getI18n();
  return localeMetadata(locale, `/${section}`, t(section === "about" ? "About RBA Property" : section === "faq" ? "FAQ" : "Contact"));
}
export default async function InformationPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!["about", "faq", "contact"].includes(section)) notFound();
  return <><Header theme="light" /><main id="main-content">{section === "about" ? <BrandStory /> : section === "faq" ? <FaqPreview /> : <ContactCTA />}</main><Footer /></>;
}
