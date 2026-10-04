
import { getI18n } from "@/lib/i18n/server";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

export async function BrandStory() {
  const { t, href } = await getI18n();
  return (
    <section id="about" className="home-about bg-surface scroll-mt-20" aria-labelledby="about-title">
      <div className="home-about__grid page-shell grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr] lg:gap-24">
        <Reveal className="home-about__media relative aspect-[4/3] overflow-hidden rounded-[14px] bg-sandstone md:aspect-[5/6]">
          <Image src="/images/brand-story.png" alt={t("Open-air Bali villa interior in limestone, timber, and linen")} fill className="object-cover" sizes="(max-width: 768px) 100vw, 55vw" />
        </Reveal>
        <Reveal>
          <p className="eyebrow">{t("About RBA Property")}</p>
          <h2 id="about-title" className="home-section-title display-serif mt-5 text-[clamp(2.7rem,5vw,4.2rem)] leading-[1.02] text-espresso">{t("More than properties. A considered way to live in Bali.")}</h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted">{t("RBA combines local market knowledge with a carefully selected portfolio. We help buyers move from first conversation to informed next steps with clear, practical support.")}</p>
          <Link href={href("/#contact")} className="button-secondary mt-8">{t("Meet RBA")} <span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>
    </section>
  );
}
