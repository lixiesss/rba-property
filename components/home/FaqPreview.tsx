
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { faqs } from "@/lib/content";

export async function FaqPreview() {
  const { t, href } = await getI18n();
  return (
    <section id="faq" className="home-faq section-space scroll-mt-20" aria-labelledby="faq-title">
      <div className="page-shell grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <div>
          <h2 id="faq-title" className="home-section-title display-serif text-[clamp(2.7rem,5vw,4rem)] leading-[1.02] text-espresso">{t("Questions before you begin?")}</h2>
          <p className="mt-5 max-w-md text-muted">{t("A few practical answers before you arrange a conversation or viewing.")}</p>
          <Link href={href("/#faq")} className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-teal">{t("View all FAQs")} <span aria-hidden="true">→</span></Link>
        </div>
        <div className="border-t border-line">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border-b border-line">
              <summary className="flex min-h-18 cursor-pointer items-center justify-between gap-5 py-5 font-medium text-espresso">
                <span>{t(faq.question)}</span><span aria-hidden="true" className="text-2xl font-light text-teal group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-muted">{t(faq.answer)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
