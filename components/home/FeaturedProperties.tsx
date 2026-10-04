
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { getFeaturedProperties } from "@/lib/data/properties";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Reveal } from "@/components/motion/Reveal";

export async function FeaturedProperties() {
  const { t, href, locale } = await getI18n();
  const properties = await getFeaturedProperties(locale);
  return (
    <section className="home-featured section-space" aria-labelledby="featured-title">
      <div className="page-shell">
        <Reveal className="max-w-3xl">
          <h2 id="featured-title" className="home-section-title display-serif text-[clamp(2.6rem,5vw,4rem)] leading-[1.02] text-espresso">{t("Exceptional properties in remarkable locations.")}</h2>
          <Link href={href("/properties")} className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-teal">{t("View all properties")} <span aria-hidden="true">→</span></Link>
        </Reveal>
        <Reveal className="home-featured__grid mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3" delay={0.06}>
          {properties.map((property) => <PropertyCard property={property} key={property.slug} />)}
        </Reveal>
      </div>
    </section>
  );
}
