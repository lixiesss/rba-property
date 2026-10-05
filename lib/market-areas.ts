export const marketAreas = [
  ["ubud", "Ubud"], ["tegallalang", "Tegallalang"], ["gianyar", "Gianyar"],
  ["canggu", "Canggu"], ["pererenan", "Pererenan"], ["uluwatu", "Uluwatu"],
  ["seminyak", "Seminyak"], ["sanur", "Sanur"], ["tabanan", "Tabanan"], ["other", "Other"],
] as const;
export type MarketArea = (typeof marketAreas)[number][0];
export function parseMarketArea(value: unknown): MarketArea | undefined {
  if (typeof value !== "string") return undefined;
  const key = value.trim().toLowerCase();
  return marketAreas.find(([area]) => area === key)?.[0];
}
export function matchesMarketArea(property: { marketArea?: string }, area?: string) {
  return !area || property.marketArea === area;
}
