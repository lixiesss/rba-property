
import { getI18n } from "@/lib/i18n/server";
import Image from "next/image";
import Link from "next/link";
import { setPropertyPublication } from "@/app/admin/(protected)/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { mapOffers, formatOffer, offersLabel } from "@/lib/offers";
import { adminPropertyTitle } from "@/lib/i18n/property-content";
import type { PropertyTranslation } from "@/lib/i18n/config";

type Query = Record<string, string | string[] | undefined>;

export default async function AdminPropertiesPage({ searchParams }: { searchParams: Promise<Query> }) {
  const { t, href, locale } = await getI18n();
  if (!hasSupabaseEnv()) return null;
  const query = await searchParams;
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  const supabase = await createClient();
  let request = supabase.from("properties").select("*, property_translations(*), property_images(*), property_offers(*)").order("updated_at", { ascending: false });
  if (value("publication")) request = request.eq("publication_status", value("publication"));
  if (value("availability")) request = request.eq("availability_status", value("availability"));
  if (value("type")) request = request.eq("property_type", value("type"));
  if (value("location")) request = request.ilike("location", `%${value("location")}%`);
  const { data: rows, error } = await request;
  const data = rows?.filter(property => (!value("listing") || mapOffers(property.property_offers).some(offer => offer.offerType === value("listing"))) && (!value("q") || [property.slug, ...property.property_translations.map((content: PropertyTranslation) => content.title)].some(text => text.toLowerCase().includes(value("q").toLowerCase()))));

  return (
    <main className="admin-content">
      <div className="admin-page-header"><div><p className="admin-kicker">{t("Catalogue")}</p><h1>{t("Properties")}</h1></div><Link href="/admin/properties/new" className="admin-button">{t("Add property")}</Link></div>
      {value("error") || error ? <p className="admin-alert">{value("error") || error?.message}</p> : null}
      <form className="admin-filters">
        <input name="q" aria-label={t("Search properties")} placeholder={t("Search title or slug")} defaultValue={value("q")} />
        <select name="publication" aria-label={t("Publication status")} defaultValue={value("publication")}><option value="">{t("All publication")}</option>{["draft", "published", "archived"].map(x => <option value={x} key={x}>{t(x)}</option>)}</select>
        <select name="availability" aria-label={t("Availability")} defaultValue={value("availability")}><option value="">{t("All availability")}</option>{["available", "under_offer", "reserved", "sold"].map(x => <option value={x} key={x}>{t(x)}</option>)}</select>
        <select name="type" aria-label={t("Property type")} defaultValue={value("type")}><option value="">{t("All types")}</option>{["villa", "land", "investment"].map(x => <option value={x} key={x}>{t(x)}</option>)}</select>
        <select name="listing" aria-label={t("Listing type")} defaultValue={value("listing")}><option value="">{t("Sale / lease")}</option><option value="sale">{t("sale")}</option><option value="lease">{t("lease")}</option></select>
        <input name="location" aria-label={t("Location")} placeholder={t("Location")} defaultValue={value("location")} />
        <button className="admin-button-secondary">{t("Filter")}</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>{t("Property")}</th><th>{t("Price")}</th><th>{t("Publication")}</th><th>{t("Availability")}</th><th>{t("Updated")}</th><th><span className="sr-only">{t("Actions")}</span></th></tr></thead>
          <tbody>{data?.map((property) => {
            const images = Array.isArray(property.property_images) ? property.property_images : [];
            const thumbnail = images.find((image: Record<string, unknown>) => image.is_thumbnail) ?? images[0];
            const imageUrl = thumbnail ? supabase.storage.from("property-media").getPublicUrl(thumbnail.storage_path).data.publicUrl : null;
            const nextStatus = property.publication_status === "published" ? "draft" : "published";
            return <tr key={property.id}>
              <td><div className="admin-property-cell">{imageUrl ? <Image src={imageUrl} alt="" width={72} height={54} unoptimized className="admin-thumb" /> : <div className="admin-thumb admin-thumb-empty" />}<div><Link href={`/admin/properties/${property.id}/edit`}>{t(adminPropertyTitle(property, locale))}</Link><small>{property.location} · {t(property.property_type)}</small></div></div></td>
              <td><small>{t(offersLabel(mapOffers(property.property_offers)))}</small><div>{mapOffers(property.property_offers)[0] ? formatOffer(mapOffers(property.property_offers)[0], locale) : t("No offers")}</div></td>
              <td><Status value={property.publication_status} /></td><td><Status value={property.availability_status} /></td><td>{new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", { dateStyle: "medium" }).format(new Date(property.updated_at))}</td>
              <td><div className="admin-row-actions"><Link href={`/admin/properties/${property.id}/edit`}>{t("Edit")}</Link>{property.publication_status === "published" ? <Link href={href(`/properties/${property.slug}`)} target="_blank">{t("Preview")}</Link> : null}<form action={setPropertyPublication.bind(null, property.id, nextStatus)}><button>{nextStatus === "draft" ? t("Unpublish") : t("Publish")}</button></form>{property.publication_status !== "archived" ? <form action={setPropertyPublication.bind(null, property.id, "archived")}><button>{t("Archive")}</button></form> : null}</div></td>
            </tr>;
          })}</tbody>
        </table>
        {!data?.length ? <p className="admin-empty">{t("No properties match these filters.")}</p> : null}
      </div>
    </main>
  );
}

async function Status({ value }: { value: string }) { const { t } = await getI18n(); return <span className={`admin-status admin-status-${value}`}>{t(value)}</span>; }
