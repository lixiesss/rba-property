import "server-only";

import { unstable_cache } from "next/cache";
import { properties as fixtureProperties } from "@/lib/properties";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { mapOffers, type PropertyOffer } from "@/lib/offers";
import type { PriceBasis } from "@/lib/offers";
import { matchesPrice } from "@/lib/property-filters";
import { defaultLocale, locales, type Locale, type PropertyTranslation } from "@/lib/i18n/config";
import { localizedContent } from "@/lib/i18n/property-content";

export type ListingType = "sale" | "lease";
export type PropertyType = "villa" | "land" | "investment";
export type PublicationStatus = "draft" | "published" | "archived";
export type AvailabilityStatus = "available" | "under_offer" | "reserved" | "sold";

export interface PropertyImage {
  id: string;
  storagePath: string;
  src: string;
  alt: string;
  caption?: string;
  sortOrder: number;
  isThumbnail: boolean;
}

export interface PublicProperty {
  locale: Locale;
  contentLocale: Locale;
  availableLocales: Locale[];
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  offers: PropertyOffer[];
  propertyType: PropertyType;
  location: string;
  district: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  landSizeM2: number;
  buildingSizeM2?: number;
  ownership?: string;
  leaseExpiry?: string;
  certificate?: string;
  zoning?: string;
  roadAccessM?: number;
  frontageM?: number;
  mapUrl?: string;
  views: string[];
  certificateCount?: number;
  topography?: string;
  videos: PropertyVideo[];
  features: string[];
  amenities: string[];
  availability: AvailabilityStatus;
  publicationStatus: PublicationStatus;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt: string;
  images: PropertyImage[];
  thumbnail?: PropertyImage;
}

export interface PropertyVideo {
  id: string;
  src: string;
  title?: string;
  caption?: string;
  sortOrder: number;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  priceBasis?: PriceBasis;
  location?: string;
  type?: PropertyType | "";
  listingType?: ListingType | "";
  availability?: AvailabilityStatus | "";
}

type PropertyRow = Record<string, unknown> & {
  property_translations?: PropertyTranslation[];
  property_images?: Array<Record<string, unknown>>;
  property_offers?: Array<Record<string, unknown>>;
  property_videos?: Array<Record<string, unknown>>;
};

const fixtureIndonesian = [
  { title: "Villa Tebing Uluwatu", description: "Hunian tenang di tebing Uluwatu dengan pemandangan laut, teras teduh, dan material batu alam." },
  { title: "Villa Halaman Pererenan", description: "Villa berarsitektur terbuka dengan taman pribadi dan kolam renang di dekat desa Pererenan." },
  { title: "Tanah Berpemandangan Tegallalang", description: "Lahan berkontur landai dengan pemandangan sawah terbuka dan jalur akses yang sudah tersedia." },
];

function fixtureData(locale: Locale): PublicProperty[] {
  return fixtureProperties.map((property, index) => {
    const image: PropertyImage = {
      id: `fixture-image-${index + 1}`,
      storagePath: property.heroImage.src,
      src: property.heroImage.src,
      alt: property.heroImage.alt,
      sortOrder: 0,
      isThumbnail: true,
    };

    return {
      locale,
      contentLocale: locale,
      availableLocales: [...locales],
      id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      slug: property.slug,
      title: locale === "id" ? fixtureIndonesian[index].title : property.title,
      shortDescription: locale === "id" ? fixtureIndonesian[index].description : property.description,
      description: locale === "id" ? fixtureIndonesian[index].description : property.description,
      offers: [{ offerType: property.listingType, price: property.price, currency: property.currency, priceBasis: "global", negotiable: false, sortOrder: 0 }],
      propertyType: property.propertyType,
      location: property.location,
      district: property.district,
      latitude: property.coordinates?.latitude,
      longitude: property.coordinates?.longitude,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      landSizeM2: property.landSizeM2,
      buildingSizeM2: property.buildingSizeM2,
      ownership: property.ownership,
      leaseExpiry: property.leaseExpiry,
      certificate: property.certificate,
      zoning: property.zoning,
      features: property.features,
      amenities: [],
      views: [],
      videos: [],
      availability: property.availability === "under-offer" ? "under_offer" : property.availability,
      publicationStatus: "published",
      featured: property.featured,
      updatedAt: new Date(0).toISOString(),
      images: [image],
      thumbnail: image,
    };
  });
}

function requireBackendOrFixtures(locale: Locale) {
  if (hasSupabaseEnv()) return null;
  if (process.env.NODE_ENV === "development") return fixtureData(locale);
  throw new Error("RBA public data requires Supabase environment variables in production.");
}

function numberOrUndefined(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapProperty(row: PropertyRow, publicUrl: (path: string) => string, locale: Locale, content: PropertyTranslation): PublicProperty {
  const images = (row.property_images ?? [])
    .map((image): PropertyImage => ({
      id: String(image.id),
      storagePath: String(image.storage_path),
      src: publicUrl(String(image.storage_path)),
      alt: String(image.alt_text || content.title || "RBA Property"),
      caption: image.caption ? String(image.caption) : undefined,
      sortOrder: Number(image.sort_order ?? 0),
      isThumbnail: Boolean(image.is_thumbnail),
    }))
    .sort((a, b) => Number(b.isThumbnail) - Number(a.isThumbnail) || a.sortOrder - b.sortOrder);

  return {
    locale,
    contentLocale: content.locale,
    availableLocales: (row.property_translations ?? []).filter(value => [value.title, value.short_description, value.description].some(text => text?.trim())).map(value => value.locale),
    id: String(row.id),
    slug: String(row.slug),
    title: content.title,
    shortDescription: content.short_description,
    description: content.description,
    offers: mapOffers(row.property_offers),
    propertyType: row.property_type as PropertyType,
    location: String(row.location),
    district: String(row.district ?? ""),
    address: row.address ? String(row.address) : undefined,
    latitude: numberOrUndefined(row.latitude),
    longitude: numberOrUndefined(row.longitude),
    bedrooms: numberOrUndefined(row.bedrooms),
    bathrooms: numberOrUndefined(row.bathrooms),
    landSizeM2: Number(row.land_size_m2),
    buildingSizeM2: numberOrUndefined(row.building_size_m2),
    ownership: row.ownership ? String(row.ownership) : undefined,
    leaseExpiry: row.lease_expiry ? String(row.lease_expiry) : undefined,
    certificate: row.certificate ? String(row.certificate) : undefined,
    zoning: row.zoning ? String(row.zoning) : undefined,
    roadAccessM: numberOrUndefined(row.road_access_m),
    frontageM: numberOrUndefined(row.frontage_m),
    mapUrl: row.map_url ? String(row.map_url) : undefined,
    certificateCount: numberOrUndefined(row.certificate_count),
    topography: row.topography ? String(row.topography) : undefined,
    views: Array.isArray(row.views) ? row.views.map(String) : [],
    videos: (row.property_videos ?? []).map(video => ({
      id: String(video.id), src: publicUrl(String(video.storage_path)),
      title: video.title ? String(video.title) : undefined,
      caption: video.caption ? String(video.caption) : undefined,
      sortOrder: Number(video.sort_order),
    })).sort((a,b) => a.sortOrder - b.sortOrder),
    features: Array.isArray(row.features) ? row.features.map(String) : [],
    amenities: Array.isArray(row.amenities) ? row.amenities.map(String) : [],
    availability: row.availability_status as AvailabilityStatus,
    publicationStatus: row.publication_status as PublicationStatus,
    featured: Boolean(row.featured),
    metaTitle: content.meta_title || undefined,
    metaDescription: content.meta_description || undefined,
    updatedAt: String(row.updated_at),
    images,
    thumbnail: images.find((image) => image.isThumbnail) ?? images[0],
  };
}

const fetchPublished = unstable_cache(async (locale: Locale) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_translations(*), property_images(*), property_offers(*), property_videos(*)")
    .eq("publication_status", "published")
    .order("updated_at", { ascending: false })
    .order("sort_order", { referencedTable: "property_images", ascending: true });

  if (error) throw new Error(`Unable to load properties: ${error.message}`);
  const publicUrl = (path: string) =>
    supabase.storage.from("property-media").getPublicUrl(path).data.publicUrl;
  return (data as PropertyRow[]).map(row => {
    const content = localizedContent(row.property_translations ?? [], locale, row);
    return mapProperty(row, publicUrl, locale, content);
  });
}, ["published-properties-localized-v3-field-fallback"], { revalidate: 60, tags: ["properties"] });

export async function getPublishedProperties(filters: PropertyFilters = {}, locale: Locale = defaultLocale) {
  const fixtures = requireBackendOrFixtures(locale);
  const all = fixtures ?? (await fetchPublished(locale));
  return all.filter((property) =>
    (!filters.location || property.location.toLowerCase() === filters.location.toLowerCase()) &&
    (!filters.type || property.propertyType === filters.type) &&
    (!filters.listingType || property.offers.some(offer => offer.offerType === filters.listingType)) &&
    (!filters.availability || property.availability === filters.availability) && matchesPrice(property.offers, filters),
  );
}

export async function getFeaturedProperties(locale: Locale = defaultLocale) {
  return (await getPublishedProperties({}, locale)).filter((property) => property.featured).slice(0, 6);
}

export async function getPropertyBySlug(slug: string, locale: Locale = defaultLocale) {
  return (await getPublishedProperties({}, locale)).find((property) => property.slug === slug) ?? null;
}

export async function getRelatedProperties(property: PublicProperty, locale: Locale = property.locale) {
  const all = await getPublishedProperties({}, locale);
  return all
    .filter((candidate) => candidate.id !== property.id)
    .sort((a, b) => {
      const aScore = Number(a.location === property.location) * 2 + Number(a.propertyType === property.propertyType);
      const bScore = Number(b.location === property.location) * 2 + Number(b.propertyType === property.propertyType);
      return bScore - aScore;
    })
    .slice(0, 3);
}

export function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatArea(value: number) {
  return `${new Intl.NumberFormat("en-ID").format(value)} m2`;
}
