# Inventory Migration

Apply the new migration before deploying this version of the frontend. Existing
prices are copied to offers; no existing property or photo is deleted.

From the already-linked project root:

```powershell
npx supabase db push --dry-run
npx supabase db push
```

The migration is `202610010001_inventory_offers_videos.sql`. It runs in a
transaction. Keep the previous applied migration unchanged. Do not run the seed
against production inventory; it is for development only.

New editor saves use `save_property_inventory`, an invoker-privilege function
that preserves RLS and commits property and offer changes together. Deprecated
price/listing columns remain available to older clients but are no longer read
by the public catalogue or detail page.

Videos accept MP4/WebM up to 50 MB in the existing public bucket; photos retain
their 12 MB route validation. A deployment host must accept upload request
bodies of that size. Hosting-specific direct/resumable uploads are a later
option if the host imposes a lower request-body limit.

## Verification

```powershell
npm run test:inventory
npm run typecheck
npm run lint
npm run build
```

The SQL test runs when `RBA_PGLITE_MODULE` points to a temporary installation of
`@electric-sql/pglite/dist/index.js`. This test runtime is not an application
dependency. Without it the migration test is explicitly skipped.

After applying the migration, verify the existing Test Villa in admin and on
its stored public slug. Confirm its original price has become a global offer,
then test sale-only, lease-only, both offers, per-Are sale and per-Are-per-year
lease. Also check publication requires an offer and photo thumbnail; photo
upload/thumbnail/order still work; videos can be uploaded, edited, reordered,
played without autoplay, and deleted; availability, inquiries and settings
still work. Keep the existing Test Villa until these hosted checks pass.
