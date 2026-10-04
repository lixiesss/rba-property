export type OfferType = "sale" | "lease";
export type PriceBasis = "global" | "per_are" | "per_are_per_year";

export interface PropertyOffer {
  offerType: OfferType;
  price: number;
  currency: string;
  priceBasis: PriceBasis;
  negotiable: boolean;
  sortOrder: number;
}

export function offersLabel(offers: PropertyOffer[]) {
  const sale = offers.some(offer => offer.offerType === "sale");
  const lease = offers.some(offer => offer.offerType === "lease");
  return sale && lease ? "Sale & Lease" : sale ? "Sale" : lease ? "Lease" : "No offers";
}

export function formatOffer(offer: PropertyOffer, locale: "id" | "en" = "en") {
  const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(offer.price);
  const basis = offer.priceBasis === "per_are" ? " / are" : offer.priceBasis === "per_are_per_year" ? ` / are / ${locale === "id" ? "tahun" : "year"}` : "";
  return `${offer.currency} ${amount}${basis}`;
}

export function mapOffers(rows: Array<Record<string, unknown>> = []): PropertyOffer[] {
  return rows.map(row => ({
    offerType: row.offer_type as OfferType, price: Number(row.price), currency: String(row.currency),
    priceBasis: row.price_basis as PriceBasis, negotiable: Boolean(row.negotiable), sortOrder: Number(row.sort_order),
  })).sort((a, b) => a.sortOrder - b.sortOrder || a.offerType.localeCompare(b.offerType));
}
