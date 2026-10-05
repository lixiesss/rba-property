"use client";
import { useI18n } from "@/lib/i18n/client";


import Link from "next/link";
import { useState } from "react";
import { OfferEditor } from "@/components/admin/OfferEditor";
import { LandSizeInput } from "@/components/admin/LandSizeInput";
import { locales, translationReady, type Locale, type PropertyTranslation } from "@/lib/i18n/config";

type Value = Record<string, unknown>;

const text = (value: unknown) => value === null || value === undefined ? "" : String(value);
const lines = (value: unknown) => Array.isArray(value) ? value.join("\n") : text(value);

export function PropertyForm({
  action,
  property = {},
  isNew = false,
  error,
  saved,
  media,
}: {
  action: (formData: FormData) => void | Promise<void>;
  property?: Value;
  isNew?: boolean;
  error?: string;
  saved?: string;
  media?: React.ReactNode;
}) {
  const { t } = useI18n();
  const status = text(property.publication_status || "draft");
  const [propertyType, setPropertyType] = useState(text(property.property_type || "villa"));
  const [location, setLocation] = useState(text(property.location));
  const [contentLocale, setContentLocale] = useState<Locale>("id");
  const [content, setContent] = useState<Record<Locale, PropertyTranslation>>(() => Object.fromEntries(locales.map(locale => {
    const initial = Array.isArray(property.property_translations) ? property.property_translations.find(value => value.locale === locale) : undefined;
    return [locale, { locale, title: text(initial?.title), short_description: text(initial?.short_description), description: text(initial?.description), meta_title: text(initial?.meta_title), meta_description: text(initial?.meta_description) }];
  })) as Record<Locale, PropertyTranslation>);
  return (
    <form action={action} className="space-y-6">
      {error ? <p className="admin-alert" role="alert">{t(error)}</p> : null}
      {saved ? <p className="admin-success" role="status">{t(saved)}</p> : null}

      <EditorSection title={t("Basic")}>
        <Field label={t("Slug")} name="slug" defaultValue={property.slug} required hint={t("Lowercase words separated by hyphens.")} />
        <Select label={t("Property type")} name="property_type" value={propertyType} options={["villa", "land", "investment"]} onChange={setPropertyType} />
      </EditorSection>

      <EditorSection title={t("Content")}>
        <div className="admin-field-full">
          <div role="tablist" aria-label={t("Content")} className="flex gap-3 border-b border-line pb-3">
            {locales.map(locale => <button key={locale} type="button" role="tab" id={`content-tab-${locale}`} aria-controls={`content-panel-${locale}`} aria-selected={contentLocale === locale} onClick={() => setContentLocale(locale)} className={contentLocale === locale ? "admin-button" : "admin-button-secondary"}>{locale === "id" ? "Indonesia" : "English"} · {t(translationReady(content[locale]) ? t("Complete") : t("Incomplete"))}</button>)}
          </div>
          {locales.map(locale => <div key={locale} role="tabpanel" id={`content-panel-${locale}`} aria-labelledby={`content-tab-${locale}`} hidden={contentLocale !== locale} className="pt-4">
            <p className="mb-4 text-sm text-muted">{locale === "id" ? "Indonesia" : "English"}: {t(translationReady(content[locale]) ? t("Complete") : t("Incomplete"))}</p>
            {!translationReady(content[locale]) ? <p className="mb-4 text-sm text-clay">{t("Incomplete translation. Missing fields use the other language or legacy content. Publication controls visibility.")}</p> : null}
            <div className="admin-form-grid">{(["title", "short_description", "description", "meta_title", "meta_description"] as const).map(field => {
              const labels = { title: "Title", short_description: "Short description", description: "Full description", meta_title: "Meta title", meta_description: "Meta description" };
              const update = (value: string) => setContent(current => ({ ...current, [locale]: { ...current[locale], [field]: value } }));
              return <label key={field} className={`admin-field ${field !== "meta_title" ? "admin-field-full" : ""}`}><span>{t(labels[field])}</span>{field === "description" ? <textarea name={`${locale}_${field}`} value={content[locale][field]} onChange={event => update(event.target.value)} rows={5} maxLength={30000} /> : <input name={`${locale}_${field}`} value={content[locale][field] ?? ""} onChange={event => update(event.target.value)} maxLength={field === "title" ? 140 : field === "short_description" ? 280 : field === "meta_title" ? 70 : 170} />}</label>;
            })}</div>
          </div>)}
        </div>
      </EditorSection>

      <EditorSection title={t("Location")}>
        <Field label={t("Location")} name="location" defaultValue={property.location} onChange={event => setLocation(event.target.value)} hint={!location.trim() ? t("Location is required before publishing this property.") : undefined} />
        <Field label={t("District")} name="district" defaultValue={property.district} />
        <Field label={t("Address")} name="address" defaultValue={property.address} full />
        <Field label={t("Google Maps URL")} name="map_url" type="url" defaultValue={property.map_url} full />
        <Field label={t("Latitude")} name="latitude" type="number" step="any" defaultValue={property.latitude} />
        <Field label={t("Longitude")} name="longitude" type="number" step="any" defaultValue={property.longitude} />
      </EditorSection>

      <EditorSection title={t("Offers")}>
        <OfferEditor initialOffers={Array.isArray(property.property_offers) ? property.property_offers : []} />
      </EditorSection>

      <EditorSection title={propertyType === "land" ? t("Land specifications") : t("Specifications")}>
        <LandSizeInput initialM2={property.land_size_m2 ? Number(property.land_size_m2) : undefined} />
        <Field label={t("Road access width (m)")} name="road_access_m" type="number" min="0" step="0.01" defaultValue={property.road_access_m} />
        <Field label={t("Frontage (m)")} name="frontage_m" type="number" min="0" step="0.01" defaultValue={property.frontage_m} />
        <Field label={t("Topography")} name="topography" defaultValue={property.topography} />
        <div className="admin-field-full"><h3 className="mb-3 text-sm font-semibold">{propertyType === "land" ? t("Existing buildings (optional)") : t("Building specifications")}</h3><div className="admin-form-grid">
          <Field label={t("Bedrooms")} name="bedrooms" type="number" min="0" defaultValue={property.bedrooms} />
          <Field label={t("Bathrooms")} name="bathrooms" type="number" min="0" defaultValue={property.bathrooms} />
          <Field label={t("Building size (m2)")} name="building_size_m2" type="number" min="0" step="0.01" defaultValue={property.building_size_m2} />
        </div></div>
      </EditorSection>

      <EditorSection title={t("Legal / ownership")}>
        <Field label={t("Ownership")} name="ownership" defaultValue={property.ownership} />
        <Field label={t("Certificate")} name="certificate" defaultValue={property.certificate} />
        <Field label={t("Certificate count")} name="certificate_count" type="number" min="0" defaultValue={property.certificate_count} />
        <Field label={t("Zoning")} name="zoning" defaultValue={property.zoning} />
        <Field label={t("Lease expiry")} name="lease_expiry" type="date" defaultValue={property.lease_expiry} />
      </EditorSection>

      <EditorSection title={t("Features")}>
        <TextArea label={t("Features")} name="features" defaultValue={lines(property.features)} hint={t("One per line or comma-separated.")} />
        <TextArea label={t("Amenities")} name="amenities" defaultValue={lines(property.amenities)} hint={t("One per line or comma-separated.")} />
        <TextArea label={t("Views")} name="views" defaultValue={lines(property.views)} hint={t("One per line or comma-separated. Custom views are welcome.")} />
      </EditorSection>

      {media ? <EditorSection title={t("Media")}>{media}</EditorSection> : null}


      <EditorSection title={t("Publishing")}>
        <Select label={t("Availability")} name="availability_status" value={text(property.availability_status || "available")} options={["available", "under_offer", "reserved", "sold"]} />
        <label className="admin-checkbox"><input type="checkbox" name="featured" defaultChecked={Boolean(property.featured)} /> {t("Featured property")}</label>
        {!isNew ? <p className="self-end pb-3 text-sm text-muted">{t("Current status:")} <strong className="text-ink">{t(status)}</strong></p> : null}
      </EditorSection>

      <div className="admin-form-actions">
        <button className="admin-button" type="submit" name="intent" value={isNew ? "draft" : "save"}>{isNew ? t("Create draft") : t("Save changes")}</button>
        {!isNew && property.slug ? <Link className="admin-button-secondary" href={`/${contentLocale}/properties/${property.slug}`} target="_blank">{t("Preview")}</Link> : null}
        {!isNew && status !== "published" ? <button className="admin-button-secondary" type="submit" name="intent" value="publish">{t("Publish")}</button> : null}
        {!isNew && status === "published" ? <button className="admin-button-secondary" type="submit" name="intent" value="draft">{t("Unpublish")}</button> : null}
        {!isNew && status !== "archived" ? <button className="admin-danger-button" type="submit" name="intent" value="archive">{t("Archive")}</button> : null}
      </div>
    </form>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="admin-panel"><h2>{title}</h2><div className="admin-form-grid">{children}</div></section>;
}

function Field({ label, name, defaultValue, hint, full, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "name"> & { label: string; name: string; defaultValue?: unknown; hint?: string; full?: boolean }) {
  return <label className={`admin-field ${full ? "admin-field-full" : ""}`}><span>{label}</span><input name={name} defaultValue={text(defaultValue)} {...props} />{hint ? <small>{hint}</small> : null}</label>;
}

function TextArea({ label, name, defaultValue, hint, required }: { label: string; name: string; defaultValue?: unknown; hint?: string; required?: boolean }) {
  return <label className="admin-field admin-field-full"><span>{label}</span><textarea name={name} defaultValue={text(defaultValue)} rows={5} required={required} />{hint ? <small>{hint}</small> : null}</label>;
}

function Select({ label, name, value, options, onChange }: { label: string; name: string; value: string; options: string[]; onChange?: (value: string) => void }) {
  const { t } = useI18n();
  return <label className="admin-field"><span>{label}</span><select name={name} defaultValue={value} onChange={event => onChange?.(event.target.value)}>{options.map((option) => <option value={option} key={option}>{t(option)}</option>)}</select></label>;
}
