import { id } from "./id";
// English source phrases are stable message keys shared by both dictionaries.
export const en = Object.fromEntries(Object.keys(id).map(key => [key, key])) as Record<keyof typeof id, string>;
Object.assign(en, {
  villa: "Villa", land: "Land", investment: "Investment property", available: "Available",
  under_offer: "Under offer", reserved: "Reserved", sold: "Sold", sale: "Sale", lease: "Lease",
  draft: "Draft", published: "Published", archived: "Archived", new: "New", contacted: "Contacted",
  qualified: "Qualified", closed: "Closed", spam: "Spam", admin: "Admin", editor: "Editor",
  global: "Total price", per_are: "Per are", per_are_per_year: "Per are / year",
});
