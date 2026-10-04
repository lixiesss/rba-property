
import { getI18n } from "@/lib/i18n/server";
import Image from "next/image";
import Link from "next/link";
import { formatArea, type PublicProperty } from "@/lib/data/properties";
import { offersLabel, formatOffer } from "@/lib/offers";

export async function PropertyCard({ property }: { property: PublicProperty }) {
  const { t, href, locale } = await getI18n();
  const facts = [
    property.bedrooms ? `${property.bedrooms} ${t("beds")}` : null,
    property.bathrooms ? `${property.bathrooms} ${t("baths")}` : null,
    formatArea(property.landSizeM2),
  ].filter(Boolean).join(" / ");

  return (
    <article className="group border-b border-line pb-6">
      <Link href={href(`/properties/${property.slug}`)} className="image-link block" aria-label={`${t("View")} ${property.title}`}>
        <div className="property-card__media relative aspect-[4/3] overflow-hidden rounded-[12px] bg-sandstone">
          {property.thumbnail ? (
            <Image src={property.thumbnail.src} alt={property.thumbnail.alt} fill className="image-zoom object-cover" sizes="(min-width: 1360px) 384px, (min-width: 1024px) 28vw, (min-width: 768px) 44vw, 92vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">{t("Image coming soon")}</div>
          )}
        </div>
        <div className="pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">{t(property.propertyType)} · {t(offersLabel(property.offers))}</p>
          <h3 className="display-serif mt-2 text-[1.75rem] leading-tight text-espresso">{property.title}</h3>
          <p className="mt-1 text-sm text-muted">{property.location}, Bali</p>
          <p className="mt-4 text-sm text-muted">{facts}</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>{property.offers[0] ? <><p className="font-semibold text-espresso">{formatOffer(property.offers[0], locale)}</p>{property.offers[0].negotiable ? <p className="text-xs text-muted">{t("Negotiable")}</p> : null}</> : <p className="text-sm text-muted">{t("Enquire for pricing")}</p>}</div>
            <span aria-hidden="true" className="text-xl text-teal transition-transform group-hover:translate-x-1">-&gt;</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
