
import { getI18n } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { localeMetadata } from "@/lib/i18n/metadata";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertySearch } from "@/components/home/PropertySearch";
import { parsePrice } from "@/lib/property-filters";
import type { PriceBasis } from "@/lib/offers";
import { getPublishedProperties, type PropertyType, type ListingType } from "@/lib/data/properties";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return localeMetadata(locale, "/properties", t("Properties in Bali"));
}
export const dynamic = "force-dynamic";

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t, href, locale } = await getI18n();
  const query = await searchParams;
  const location = typeof query.location === "string" ? query.location : "";
  const type = typeof query.type === "string" ? query.type as PropertyType : "";
  const listing = typeof query.listing === "string" ? query.listing : typeof query.listingType === "string" ? query.listingType : "";
  const minPrice = parsePrice(typeof query.minPrice === "string" ? query.minPrice : undefined);
  const maxPrice = parsePrice(typeof query.maxPrice === "string" ? query.maxPrice : undefined);
  const priceBasis: PriceBasis = query.priceBasis === "per_are" || query.priceBasis === "per_are_per_year" ? query.priceBasis : "global";
  const [all, filtered] = await Promise.all([
    getPublishedProperties({}, locale),
    getPublishedProperties({ location, type, listingType: ["sale", "lease"].includes(listing) ? listing as ListingType : "", minPrice, maxPrice, priceBasis }, locale),
  ]);

  return (
    <>
      <header className="border-b border-line bg-ivory">
        <div className="page-shell flex h-18 items-center justify-between">
          <Link href={href("/")} className="font-semibold tracking-[0.12em]">RBA PROPERTY</Link>
          <div className="flex items-center gap-3"><LanguageSwitcher /><Link href={href("/#contact")} className="button-primary">{t("Get in Touch")}</Link></div>
        </div>
      </header>
      <main id="main-content" className="section-space min-h-[70dvh]">
        <div className="page-shell">
          <p className="eyebrow">{t("Property catalogue")}</p>
          <h1 className="display-serif mt-4 text-[clamp(3rem,6vw,5rem)] leading-none text-espresso">{t("Properties in Bali")}</h1>
          <PropertySearch catalogue values={{ location, type, listing, priceBasis, minPrice: minPrice?.toString() ?? "", maxPrice: maxPrice?.toString() ?? "" }} locations={[...new Set(all.map(property => property.location))]} />
          {minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice ? <p role="alert" className="mt-4 text-clay">{t("Max price must be at least Min price.")}</p> : null}
          <p className="mt-5 text-muted">{filtered.length} {filtered.length === 1 ? t("property") : t("properties")}</p>
          {filtered.length ? (
            <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">{filtered.map((property) => <PropertyCard key={property.slug} property={property} />)}</div>
          ) : (
            <div className="mt-12 border-t border-line py-12">
              <h2 className="display-serif text-3xl text-espresso">{t("No matching properties yet.")}</h2>
              <p className="mt-3 text-muted">{t("Try a broader location or property type.")}</p>
              <Link href={href("/properties")} className="button-secondary mt-6">{t("Clear filters")}</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
