
import { getI18n } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { InquiryForm } from "@/components/property/InquiryForm";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { formatArea, getPropertyBySlug, getRelatedProperties } from "@/lib/data/properties";
import { offersLabel, formatOffer } from "@/lib/offers";
import { localeMetadata } from "@/lib/i18n/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const slug = (await params).slug;
  const property = await getPropertyBySlug(slug, locale);
  if (!property) return { title: `${t("Property not found")} | RBA Property`, robots: { index: false } };
  return localeMetadata(property.contentLocale, `/properties/${slug}`, property.metaTitle || property.title, property.metaDescription || property.shortDescription, property.availableLocales);
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t, href, locale } = await getI18n();
  const property = await getPropertyBySlug((await params).slug, locale);
  if (!property) notFound();
  const related = await getRelatedProperties(property, locale);
  const specs = [
    property.bedrooms !== undefined ? ["Bedrooms", property.bedrooms] : null,
    property.bathrooms !== undefined ? ["Bathrooms", property.bathrooms] : null,
    ["Land", formatArea(property.landSizeM2)],
    property.buildingSizeM2 !== undefined ? ["Building", formatArea(property.buildingSizeM2)] : null,
  ].filter(Boolean) as Array<[string, string | number]>;
  const legal = [
    ["Ownership", property.ownership], ["Certificate", property.certificate], ["Zoning", property.zoning],
    ["Lease expiry", property.leaseExpiry],
    ["Road access", property.roadAccessM !== undefined ? `${property.roadAccessM} m` : undefined],
    ["Frontage", property.frontageM !== undefined ? `${property.frontageM} m` : undefined],
    ["Certificates", property.certificateCount !== undefined ? String(property.certificateCount) : undefined],
    ["Topography", property.topography],
    ["Views", property.views.length ? property.views.map(t).join(", ") : undefined],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return <><Header theme="light" /><main id="main-content" className="property-detail-page">
    <div className="property-detail-header page-shell pb-10 pt-10">
      <Link href={href("/properties")} className="text-sm font-semibold text-teal">&#8592; {t("All properties")}</Link>
      <div className="property-detail-heading mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,auto)] md:items-end">
        <div><p className="eyebrow">{t(property.propertyType)} · {t(offersLabel(property.offers))}</p>
          <h1 className="property-detail-title display-serif mt-4 text-[clamp(2.8rem,6vw,5.25rem)] leading-none break-words text-espresso">{property.title}</h1>
          <p className="property-detail-location mt-4 text-lg text-muted">{property.location}{property.district ? `, ${property.district}` : ""}, Bali</p>
          {property.mapUrl && /^https:\/\//.test(property.mapUrl) ? <a href={property.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-teal">{t("View on Google Maps")}</a> : null}
        </div>
        <div className="md:text-right"><p className="text-sm capitalize text-muted">{t(property.availability)}</p>
          {property.offers.map(offer => <div className="mt-3" key={offer.offerType}><p className="text-xs uppercase text-muted">{t(offer.offerType)}</p><p className="text-xl font-semibold text-espresso">{formatOffer(offer, locale)}</p>{offer.negotiable ? <p className="text-sm text-muted">{t("Negotiable")}</p> : null}</div>)}
        </div>
      </div>
    </div>
    <PropertyGallery images={property.images} title={property.title} />
    {property.videos.length ? <section className="property-videos page-shell"><h2 className="display-serif text-3xl text-espresso">{t("Videos")}</h2><div className="property-videos__grid">{property.videos.map(video => <figure key={video.id}><div className="property-video-frame"><video controls preload="none" playsInline poster={property.thumbnail?.src ?? property.images[0]?.src} aria-label={video.title || `${property.title} video`} src={video.src} /></div>{video.title ? <h3 className="property-video-title">{video.title}</h3> : null}{video.caption ? <figcaption className="mt-1 text-sm text-muted">{video.caption}</figcaption> : null}</figure>)}</div></section> : null}
    <section className="property-details"><div className="page-shell grid items-start gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-12"><div><div className="grid grid-cols-2 border-y border-line sm:grid-cols-4">{specs.map(([label, value]) => <div className="border-line py-5 sm:border-r sm:last:border-r-0" key={label}><p className="text-xs uppercase text-muted">{t(label)}</p><p className="mt-1 font-semibold text-espresso">{value}</p></div>)}</div><div className="mt-8"><h2 className="display-serif text-4xl text-espresso">{t("About this property")}</h2><p className="mt-5 whitespace-pre-line break-words text-lg leading-8 text-muted">{property.description}</p></div>{property.features.length ? <ListSection title={t("Features")} items={property.features} /> : null}{property.amenities.length ? <ListSection title={t("Amenities")} items={property.amenities} /> : null}{legal.length ? <div className="mt-8"><h2 className="display-serif text-3xl text-espresso">{t("Ownership and legal")}</h2><dl className="mt-5 border-t border-line">{legal.map(([label, value]) => <div className="grid grid-cols-2 border-b border-line py-4" key={label}><dt className="text-muted">{t(label)}</dt><dd className="text-espresso">{t(value)}</dd></div>)}</dl></div> : null}</div><aside className="min-w-0"><InquiryForm propertyId={property.id} propertyTitle={property.title} /></aside></div></section>
    {related.length ? <section className="property-related border-t border-line"><div className="page-shell"><h2 className="display-serif text-4xl text-espresso">{t("Related properties")}</h2><div className="mt-8 grid gap-10 md:grid-cols-2 lg:grid-cols-3">{related.map(item => <PropertyCard property={item} key={item.id} />)}</div></div></section> : null}
  </main><Footer /></>;
}

async function ListSection({ title, items }: { title: string; items: string[] }) {
  const { t } = await getI18n();
  return <div className="mt-8"><h2 className="display-serif text-3xl text-espresso">{title}</h2><ul className="mt-5 grid gap-x-8 border-t border-line sm:grid-cols-2">{items.map(item => <li className="border-b border-line py-4 text-muted" key={item}>{t(item)}</li>)}</ul></div>;
}
