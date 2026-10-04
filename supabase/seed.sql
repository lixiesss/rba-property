insert into public.properties (
  id, slug, title, short_description, description, listing_type, property_type,
  location, district, price, currency, bedrooms, bathrooms, land_size_m2,
  building_size_m2, ownership, certificate, zoning, features, amenities,
  availability_status, publication_status, featured, published_at
) values
  ('10000000-0000-4000-8000-000000000001', 'cliff-house-uluwatu', 'Cliff House Uluwatu',
   'A quiet cliffside home shaped around ocean views.',
   'A quiet cliffside home shaped around ocean views, shaded terraces, and natural stone.',
   'sale', 'villa', 'Uluwatu', 'Pecatu', 18500000000, 'IDR', 4, 4, 720, 520,
   'Business confirmation required', 'Business confirmation required', 'Business confirmation required',
   array['Ocean view', 'Infinity pool', 'Natural stone', 'Staff area'], array['Air conditioning', 'Parking'],
   'available', 'draft', true, now()),
  ('10000000-0000-4000-8000-000000000002', 'courtyard-villa-pererenan', 'Courtyard Villa Pererenan',
   'Low, open architecture arranged around a private garden.',
   'Low, open architecture arranged around a private garden and pool near Pererenan village.',
   'sale', 'villa', 'Pererenan', 'Mengwi', 12800000000, 'IDR', 3, 3, 610, 360,
   'Business confirmation required', null, null,
   array['Courtyard', 'Pool', 'Mature garden', 'Open living'], array['Air conditioning', 'Parking'],
   'available', 'draft', true, now()),
  ('10000000-0000-4000-8000-000000000003', 'tegallalang-view-land', 'Tegallalang View Land',
   'A gently sloping parcel with open rice-field views.',
   'A gently sloping parcel with open rice-field views and an existing access path.',
   'sale', 'land', 'Ubud', 'Tegallalang', 6000000000, 'IDR', null, null, 1800, null,
   'Business confirmation required', 'Business confirmation required', 'Business confirmation required',
   array['Rice-field view', 'Road access', 'Gently sloping site'], '{}',
   'available', 'draft', true, now())
on conflict (slug) do nothing;

insert into public.property_images (property_id, storage_path, alt_text, sort_order, is_thumbnail)
values
  ('10000000-0000-4000-8000-000000000001', 'seed/hero-uluwatu.png', 'Contemporary cliffside villa and infinity pool overlooking the ocean in Uluwatu', 0, true),
  ('10000000-0000-4000-8000-000000000002', 'seed/villa-pererenan.png', 'Modern tropical courtyard villa with pool and mature palms in Pererenan', 0, true),
  ('10000000-0000-4000-8000-000000000003', 'seed/land-ubud.png', 'Buildable land beside layered rice terraces near Ubud', 0, true)
on conflict (storage_path) do nothing;

-- Inventory offers: seed drafts first, then publish after offers and photos exist.
insert into public.property_offers(property_id, offer_type, price, currency, price_basis)
select id, listing_type::text::public.offer_type, price, trim(currency), 'global'
from public.properties
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003'
)
on conflict (property_id, offer_type) do nothing;

update public.properties set publication_status='published', published_at=coalesce(published_at,now())
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003'
) and publication_status='draft';

-- Upload the matching files from public/images to property-media/seed before using
-- the seed data against a hosted project.
