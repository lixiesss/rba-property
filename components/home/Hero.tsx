
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { HeroImage } from "@/components/motion/HeroImage";
import { Reveal } from "@/components/motion/Reveal";

export async function Hero() {
  const { t, href } = await getI18n();
  return (
    <section className="home-hero relative overflow-hidden bg-espresso text-white">
      <HeroImage />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,27,25,0.74)_0%,rgba(20,27,25,0.42)_42%,rgba(20,27,25,0.08)_76%)]" />
      <div className="home-hero__inner page-shell relative flex items-center">
        <Reveal className="home-hero__content max-w-[700px]">
          <p className="eyebrow !text-white/78">{t("Bali, Indonesia")}</p>
          <h1 className="home-hero__title display-serif mt-5 max-w-[780px] text-[clamp(3rem,6vw,4.8rem)] leading-[0.98] text-balance">{t("Find a place worth calling yours.")}</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/84 sm:text-lg">{t("Curated villas, land, and investment properties across Bali's most desirable locations.")}</p>
          <Link href={href("/properties")} className="button-light mt-8">{t("Explore Properties")} <span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>
    </section>
  );
}
