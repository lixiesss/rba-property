
import { getI18n } from "@/lib/i18n/server";
import Image from "next/image";
import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export async function ContactCTA() {
  const { t, href, locale } = await getI18n();
  const contactHref = getWhatsAppUrl(locale);
  return (
    <section id="contact" className="home-contact scroll-mt-20 bg-surface" aria-labelledby="contact-title">
      <div className="page-shell">
        <div className="home-contact__card relative overflow-hidden rounded-[14px] bg-espresso text-white">
          <Image src="/images/hero-uluwatu.png" alt={t("Oceanfront setting in Uluwatu at sunset")} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,63,61,0.92),rgba(23,63,61,0.58)_55%,rgba(23,63,61,0.18))]" />
          <div className="home-contact__content relative flex max-w-3xl flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
            <h2 id="contact-title" className="home-section-title display-serif text-[clamp(2.8rem,6vw,5rem)] leading-[1.01]">{t("A property should feel right before the paperwork begins.")}</h2>
            <p className="mt-6 max-w-xl text-lg text-white/78">{t("Tell us what you are looking for, and we will help shape a relevant shortlist.")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={contactHref} target="_blank" rel="noopener noreferrer" className="button-light">{t("Contact RBA")} <span aria-hidden="true">→</span></a>
              <Link href={href("/properties")} className="button-secondary !border-white/60 !text-white hover:!bg-white hover:!text-teal">{t("Browse properties")}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
