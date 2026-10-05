import { z } from "zod";
import { parseMarketArea } from "../market-areas";

const optionalNumber = z.preprocess(
  (value) => value === "" || value === null ? undefined : value,
  z.coerce.number().finite().optional(),
);

export const offerSchema = z.object({
  offer_type: z.enum(["sale", "lease"]),
  price: z.preprocess(value => value === "" || value === null ? NaN : value, z.coerce.number().finite().nonnegative()),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  price_basis: z.enum(["global", "per_are", "per_are_per_year"]),
  negotiable: z.boolean(),
  sort_order: z.number().int().nonnegative(),
}).refine(offer => offer.offer_type !== "sale" || offer.price_basis !== "per_are_per_year", {
  message: "Sale offers cannot use a yearly lease price basis",
});

export const propertyFormSchema = z.object({
  title: z.string().trim().min(2).max(140),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  short_description: z.string().trim().max(280).default(""),
  description: z.string().trim().min(10),
  offers: z.array(offerSchema).max(2).refine(offers => new Set(offers.map(o => o.offer_type)).size === offers.length, "Offer types must be unique"),
  property_type: z.enum(["villa", "land", "investment"]),
  market_area: z.preprocess(value => value === "" || value === undefined ? null : value, z.string().nullable().refine(value => value === null || parseMarketArea(value) === value, "Invalid market area")),
  location: z.preprocess(value => value === null ? "" : value, z.string().trim().max(100).default("").refine(value => !value || value.length >= 2, "Location must contain at least two characters")),
  district: z.string().trim().max(100).default(""),
  address: z.string().trim().max(300).optional(),
  latitude: optionalNumber.refine((value) => value === undefined || (value >= -90 && value <= 90), "Invalid latitude"),
  longitude: optionalNumber.refine((value) => value === undefined || (value >= -180 && value <= 180), "Invalid longitude"),
  bedrooms: optionalNumber.refine((value) => value === undefined || (Number.isInteger(value) && value >= 0), "Must be a nonnegative integer"),
  bathrooms: optionalNumber.refine((value) => value === undefined || (Number.isInteger(value) && value >= 0), "Must be a nonnegative integer"),
  land_size_m2: z.coerce.number().positive(),
  building_size_m2: optionalNumber.refine((value) => value === undefined || value >= 0, "Must be positive"),
  ownership: z.string().trim().max(160).optional(),
  certificate: z.string().trim().max(160).optional(),
  zoning: z.string().trim().max(160).optional(),
  road_access_m: optionalNumber.refine(value => value === undefined || value >= 0, "Must be nonnegative"),
  frontage_m: optionalNumber.refine(value => value === undefined || value >= 0, "Must be nonnegative"),
  certificate_count: optionalNumber.refine(value => value === undefined || (Number.isInteger(value) && value >= 0), "Must be a nonnegative integer"),
  topography: z.string().trim().max(300).optional(),
  map_url: z.string().trim().max(2048).optional().refine(value => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && (["maps.app.goo.gl", "goo.gl", "maps.google.com"].includes(url.hostname) || /(^|\.)google\.[a-z.]+$/.test(url.hostname));
    } catch { return false; }
  }, "Use an HTTPS Google Maps URL"),
  views: z.string().max(1000).optional(),
  lease_expiry: z.string().optional().refine(value => !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))), "Invalid date"),
  features: z.string().optional(),
  amenities: z.string().optional(),
  availability_status: z.enum(["available", "under_offer", "reserved", "sold"]),
  meta_title: z.string().trim().max(70).optional(),
  meta_description: z.string().trim().max(170).optional(),
});

function lines(value?: string) {
  return (value ?? "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function nullable(value?: string) {
  return value || null;
}

export function parsePropertyForm(formData: FormData) {
  const offers = (["sale", "lease"] as const).flatMap((type, index) => formData.get(`${type}_enabled`) === "on" ? [{
    offer_type: type,
    price: formData.get(`${type}_price`),
    currency: formData.get(`${type}_currency`),
    price_basis: formData.get(`${type}_basis`),
    negotiable: formData.get(`${type}_negotiable`) === "on",
    sort_order: index,
  }] : []);
  const unit = String(formData.get("land_size_unit") ?? "m2");
  const multiplier = { m2: 1, are: 100, ha: 10000 }[unit];
  const landValue = formData.get("land_size_value") ?? formData.get("land_size_m2");
  const parsed = propertyFormSchema.safeParse({
    ...Object.fromEntries(formData), offers,
    land_size_m2: multiplier ? Math.round(Number(landValue) * multiplier * 100) / 100 : NaN,
  });
  if (!parsed.success) return parsed;
  const value = parsed.data;
  return {
    success: true as const,
    data: {
      ...value,
      location: nullable(value.location),
      address: nullable(value.address),
      latitude: value.latitude ?? null,
      longitude: value.longitude ?? null,
      bedrooms: value.bedrooms ?? null,
      bathrooms: value.bathrooms ?? null,
      building_size_m2: value.building_size_m2 ?? null,
      road_access_m: value.road_access_m ?? null,
      frontage_m: value.frontage_m ?? null,
      certificate_count: value.certificate_count ?? null,
      topography: nullable(value.topography),
      map_url: nullable(value.map_url),
      views: lines(value.views),
      ownership: nullable(value.ownership),
      certificate: nullable(value.certificate),
      zoning: nullable(value.zoning),
      lease_expiry: nullable(value.lease_expiry),
      meta_title: nullable(value.meta_title),
      meta_description: nullable(value.meta_description),
      features: lines(value.features),
      amenities: lines(value.amenities),
      featured: formData.get("featured") === "on",
    },
  };
}

const translationsSchema = z.array(z.object({
  locale: z.enum(["id", "en"]),
  title: z.string().trim().max(140),
  short_description: z.string().trim().max(280),
  description: z.string().trim().max(30000),
  meta_title: z.string().trim().max(70),
  meta_description: z.string().trim().max(170),
})).length(2).refine(items => new Set(items.map(item => item.locale)).size === 2);

export function parseLocalizedPropertyForm(formData: FormData) {
  const translations = translationsSchema.safeParse(["id", "en"].map(locale => Object.fromEntries([
    ["locale", locale], ...["title", "short_description", "description", "meta_title", "meta_description"].map(field => [field, String(formData.get(`${locale}_${field}`) ?? "")]),
  ])));
  if (!translations.success) return translations;
  // Reuse factual/offer validation; legacy content fields are never submitted to storage.
  const factualForm = new FormData();
  formData.forEach((value, key) => factualForm.append(key, value));
  factualForm.set("title", "Localized draft");
  factualForm.set("description", "Localized draft validation");
  factualForm.set("short_description", "");
  factualForm.set("meta_title", "");
  factualForm.set("meta_description", "");
  const parsed = parsePropertyForm(factualForm);
  if (!parsed.success) return parsed;
  const { title, description, short_description, meta_title, meta_description, ...shared } = parsed.data;
  void [title, description, short_description, meta_title, meta_description];
  return { success: true as const, data: { ...shared, translations: translations.data } };
}
