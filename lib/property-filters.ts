import type { PropertyOffer, PriceBasis } from "@/lib/offers";

export function parsePrice(value: string | undefined): number | undefined {
  if (!value || !/^\d+(?:\.\d{1,2})?$/.test(value)) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 && amount <= Number.MAX_SAFE_INTEGER ? amount : undefined;
}

export function matchesPrice(offers: PropertyOffer[], filters: {
  minPrice?: number; maxPrice?: number; priceBasis?: PriceBasis; listingType?: string;
}) {
  const { minPrice, maxPrice } = filters;
  if (minPrice === undefined && maxPrice === undefined) return true;
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) return false;
  return offers.some((offer) =>
    (!filters.listingType || offer.offerType === filters.listingType) &&
    offer.currency === "IDR" && offer.priceBasis === (filters.priceBasis ?? "global") &&
    (minPrice === undefined || offer.price >= minPrice) &&
    (maxPrice === undefined || offer.price <= maxPrice),
  );
}
