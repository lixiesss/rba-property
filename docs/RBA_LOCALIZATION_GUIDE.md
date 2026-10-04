# RBA Localization Guide

## Architecture

Supported locales are `id` and `en`. Indonesian is the default public and admin language.
Use one shared component/layout system, fed by localized dictionaries and property content.
Never create separate Indonesian and English page components. Layout, CSS, motion,
responsive behavior, galleries and property cards must be implemented once.

Fixed interface copy belongs in `lib/i18n/messages/id.ts` and `en.ts`. English phrases
are stable dictionary keys; keep both dictionaries synchronized. Server Components use
`getI18n()`; Client Components use `useI18n()`. Request locale is resolved outside cached
public data access. Public Supabase reads remain anonymous and cookie-independent;
authenticated admin operations retain the request-scoped session client.

## Tone and Terminology

English is clear, restrained and property-specific. Indonesian should sound like an
Indonesian property business, not a word-for-word translation. Adapt marketing sentences
while preserving their intent. Do not invent promises, legal assurances or investment returns.

| English | Indonesian |
| --- | --- |
| Properties / Land / Villa | Properti / Tanah / Villa |
| For Sale / For Lease / Sale & Lease | Dijual / Disewakan / Jual & Sewa |
| Available / Reserved / Sold | Tersedia / Dipesan / Terjual |
| Negotiable | Bisa Nego |
| Land Size / Building Size | Luas Tanah / Luas Bangunan |
| Road Access / Frontage | Lebar Akses Jalan / Lebar Depan |
| Certificate / Zoning / Views | Sertifikat / Zonasi / Pemandangan |
| Related Properties | Properti Serupa |
| Ask about this property | Tanya Properti Ini |
| Send Inquiry | Kirim Pertanyaan |

Keep SHM, freehold, leasehold, villa, are, place names, currencies and contact details
recognizable. Never reinterpret legal terminology. Custom factual values and media
metadata are shared editorial data, not runtime-translated content.

## Routes and Preferences

Public routes use `/id` or `/en`, including `/properties`, `/properties/[slug]`, `/about`,
`/faq` and `/contact`. Slugs are shared. Root and legacy public URLs redirect using
`rba-locale`, falling back to Indonesian, without discarding query parameters.
The language switch preserves path, slug, filters and fragment. Filter values and all
database enums stay canonical (`land`, `sale`, `per_are`, etc.).

Admin URLs are not prefixed. `rba-admin-locale` independently controls admin interface
language. Switching it must not alter either translation or the active content tab.
API, static assets and existing authentication/session handling remain separate.

## Database and Readiness

`property_translations` holds title, short description, description and optional SEO
fields, with one unique row per property and locale. Shared facts, offers, photos,
videos, availability and slug remain single-copy in their existing tables.
Migration `202610010002_property_translations.sql` backfills existing text as English
only. It does not create Indonesian text. Legacy text columns remain deprecated
compatibility mirrors and a final read-time fallback when translated fields are absent.

Publication status alone controls public visibility. Every published property is eligible
for both locales, subject to ordinary filters and existing publication access rules.
Resolve each editorial/SEO field independently: requested language, other language, then
legacy text. Whitespace-only values are missing. Even absent text never hides a published
property. Interface language always follows the requested route. Fallback never changes
saved translations. Completeness indicators remain informational only.

Migration `202610020001_translation_public_read.sql` aligns translation SELECT authorization
with parent publication status. Anonymous users may read every translation row belonging
to a published property, including partial or empty rows. Draft and archived translations
remain private. Staff CRUD and all other table policies remain unchanged. The resolver
does not bypass RLS or use privileged credentials.

## Editing Workflow

Use the Indonesia/English tabs in the single Content section. Save incomplete drafts
freely. Translation completeness does not block publication; existing factual, offer and
thumbnail requirements remain unchanged. A published property appears in both languages.
Readiness indicators explain missing-field fallback. Complete the second
language manually; never automatically copy one language into the other.

`save_localized_property_inventory` extends the existing inventory transaction so facts,
offers and both translation records commit together. Media saves and ordering are unchanged.
Older application clients that only write legacy text columns are not supported after rollout.

## Deployment and SEO

Apply the new migration before deploying the application. From the linked Supabase project:

```powershell
npx supabase db push
```

Review pending migrations first; this command applies all pending project migrations.
If the project is not linked, link to the correct project before pushing, or run the new
migration in Supabase's SQL Editor after its prerequisite inventory migration.
Back up the database according to normal deployment practice. No migration has been
applied to the remote project by this implementation.

Set `NEXT_PUBLIC_SITE_URL` to the real production origin. Localized pages provide
locale-aware canonical and language alternates. SEO fields follow the same per-field fallback
chain. Pages using only the other language's editorial fields canonicalize to that language;
mixed requested-language content retains the requested canonical. SEO never controls visibility.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
Optional PostgreSQL migration/RLS tests use `RBA_PGLITE_MODULE` pointing to an external
temporary PGlite module; no production dependency is needed.
Before production, verify both public languages, slug/filter preservation, inquiry,
admin session and language switching, ID-only publication followed by completed English,
and unchanged offers/media. Development fixtures are bilingual and used only when
Supabase variables are intentionally absent in development. Configured Supabase is
always the source of truth; failed queries never silently fall back to fixtures.
