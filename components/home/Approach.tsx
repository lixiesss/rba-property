
import { getI18n } from "@/lib/i18n/server";
import Image from "next/image";

const principles = [
  ["01", "Local expertise", "Grounded understanding of Bali's locations, market context, and property landscape."],
  ["02", "Curated selection", "Properties considered for setting, quality, and long-term potential."],
  ["03", "Clear process", "Straightforward coordination from discovery and viewings to the next professional step."],
];

export async function Approach() {
  const { t } = await getI18n();
  return (
    <section className="home-approach bg-teal text-ivory" aria-labelledby="approach-title">
      <div className="home-approach__grid grid lg:grid-cols-2">
        <div className="home-approach__media relative min-h-[360px] lg:min-h-0">
          <Image src="/images/brand-story.png" alt={t("Limestone and timber interior reflecting RBA's material-led approach")} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
        <div className="home-approach__content flex items-center px-[var(--page-pad)] py-16 lg:py-20">
          <div className="max-w-2xl">
            <h2 id="approach-title" className="home-section-title home-approach__title display-serif text-[clamp(2.8rem,5vw,4.6rem)] leading-[1.02]">{t("Built on trust. Designed for long-term value.")}</h2>
            <div className="home-approach__list mt-12 border-t border-white/25">
              {principles.map(([number, title, body]) => (
                <div key={number} className="home-approach__item grid gap-3 border-b border-white/25 py-7 sm:grid-cols-[52px_1fr]">
                  <span className="text-sm text-[#c9b79d]">{number}</span>
                  <div><h3 className="text-xl font-medium">{t(title)}</h3><p className="mt-2 max-w-lg text-sm leading-6 text-ivory/72">{t(body)}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
