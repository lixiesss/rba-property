// Legacy fixture shape only; the public data layer converts pricing to offers.
export type ListingType = "sale" | "lease";
export type PropertyType = "villa" | "land" | "investment";
export type Currency = "IDR" | "USD";
export type Availability = "available" | "under-offer" | "sold";

export interface PropertyImage {
  src: string;
  alt: string;
}

export interface Property {
  slug: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  location: string;
  district: string;
  coordinates?: { latitude: number; longitude: number };
  price: number;
  currency: Currency;
  bedrooms?: number;
  bathrooms?: number;
  landSizeM2: number;
  buildingSizeM2?: number;
  ownership: string;
  leaseExpiry?: string;
  certificate?: string;
  zoning?: string;
  description: string;
  features: string[];
  heroImage: PropertyImage;
  gallery: PropertyImage[];
  featured: boolean;
  availability: Availability;
}

export const properties: Property[] = [
  {
    slug: "cliff-house-uluwatu",
    title: "Cliff House Uluwatu",
    listingType: "sale",
    propertyType: "villa",
    location: "Uluwatu",
    district: "Pecatu",
    coordinates: { latitude: -8.8291, longitude: 115.0849 },
    price: 18500000000,
    currency: "IDR",
    bedrooms: 4,
    bathrooms: 4,
    landSizeM2: 720,
    buildingSizeM2: 520,
    ownership: "Business confirmation required",
    certificate: "Business confirmation required",
    zoning: "Business confirmation required",
    description: "A quiet cliffside home shaped around ocean views, shaded terraces, and natural stone.",
    features: ["Ocean view", "Infinity pool", "Natural stone", "Staff area"],
    heroImage: { src: "/images/hero-uluwatu.png", alt: "Contemporary cliffside villa and infinity pool overlooking the ocean in Uluwatu" },
    gallery: [],
    featured: true,
    availability: "available",
  },
  {
    slug: "courtyard-villa-pererenan",
    title: "Courtyard Villa Pererenan",
    listingType: "sale",
    propertyType: "villa",
    location: "Pererenan",
    district: "Mengwi",
    price: 12800000000,
    currency: "IDR",
    bedrooms: 3,
    bathrooms: 3,
    landSizeM2: 610,
    buildingSizeM2: 360,
    ownership: "Business confirmation required",
    description: "Low, open architecture arranged around a private garden and pool near Pererenan village.",
    features: ["Courtyard", "Pool", "Mature garden", "Open living"],
    heroImage: { src: "/images/villa-pererenan.png", alt: "Modern tropical courtyard villa with pool and mature palms in Pererenan" },
    gallery: [],
    featured: true,
    availability: "available",
  },
  {
    slug: "tegallalang-view-land",
    title: "Tegallalang View Land",
    listingType: "sale",
    propertyType: "land",
    location: "Ubud",
    district: "Tegallalang",
    price: 6000000000,
    currency: "IDR",
    landSizeM2: 1800,
    ownership: "Business confirmation required",
    certificate: "Business confirmation required",
    zoning: "Business confirmation required",
    description: "A gently sloping parcel with open rice-field views and an existing access path.",
    features: ["Rice-field view", "Road access", "Gently sloping site"],
    heroImage: { src: "/images/land-ubud.png", alt: "Buildable land beside layered rice terraces near Ubud" },
    gallery: [],
    featured: true,
    availability: "available",
  },
];

export function formatPrice(value: number, currency: Currency) {
  return new Intl.NumberFormat("en-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatArea(value: number) {
  return `${new Intl.NumberFormat("en-ID").format(value)} m2`;
}
