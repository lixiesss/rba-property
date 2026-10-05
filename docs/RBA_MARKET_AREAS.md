# Market Areas and General Contact

`properties.market_area` is nullable text, separate from detailed `location`.
Supported canonical keys and display names live in `lib/market-areas.ts`.
Drafts may omit both fields. Publishing requires Location and Market Area alongside
the existing offer/thumbnail checks; translation completeness remains informational.
Staff must classify ambiguous records manually, never inventing Location.

Apply `202610050002_property_market_area.sql` with `npx supabase db push` after reviewing
pending migrations. It adds the field/index and a small transactional save wrapper.
The existing inventory, offer, translation and media logic remains delegated unchanged.
This migration has not been applied remotely by Codex.

Backfill matches explicit named areas in existing Location. Tegallalang includes Ceking,
Kenderan and Manuaba. Gianyar yields to a single more specific market. Multiple specific
markets or missing Location remain unclassified. Non-null manually selected areas are
never overwritten. Detailed Location, publication status and media are not changed.

Public discovery generates `?area=<key>`. Recognized legacy `?location=<key>` links
remain compatible; unrecognized detailed legacy Location filters retain exact matching.
No Area query means no Area restriction. Default price/offer behavior is unchanged.
Homepage destinations retain their existing layout. Entries with no published inventory
are non-clickable and labelled unavailable. The existing Tabanan slot now represents
Tegallalang; its dimensions and image remain unchanged.

General direct-contact buttons use `getWhatsAppUrl(locale)` from `lib/whatsapp.ts`.
The number is `6282139927129`; messages are encoded once and differ by interface locale.
Buttons open a new tab with `noopener noreferrer`. Contact navigation, site settings,
property inquiry forms and submit actions are not replaced.
