begin;

create type public.offer_type as enum ('sale', 'lease');
create type public.price_basis as enum ('global', 'per_are', 'per_are_per_year');

alter table public.properties
  add column road_access_m numeric(10,2) check (road_access_m >= 0),
  add column frontage_m numeric(10,2) check (frontage_m >= 0),
  add column map_url text,
  add column views text[],
  add column certificate_count integer check (certificate_count >= 0),
  add column topography text;

-- Retained solely for compatibility with old clients and seed scripts.
alter table public.properties alter column price set default 0;
alter table public.properties alter column listing_type set default 'sale';
comment on column public.properties.price is 'Deprecated: use property_offers.price';
comment on column public.properties.currency is 'Deprecated: use property_offers.currency';
comment on column public.properties.listing_type is 'Deprecated: derive from property_offers';

create table public.property_offers (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  offer_type public.offer_type not null,
  price numeric(18,2) not null check (price >= 0),
  currency text not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  price_basis public.price_basis not null default 'global',
  negotiable boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, offer_type),
  check (offer_type <> 'sale' or price_basis <> 'per_are_per_year')
);
create index property_offers_type_idx on public.property_offers(offer_type, property_id);
create trigger property_offers_updated before update on public.property_offers
for each row execute function public.set_updated_at();

insert into public.property_offers(property_id, offer_type, price, currency)
select id, listing_type::text::public.offer_type, price, trim(currency) from public.properties;

create table public.property_videos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null unique,
  title text,
  caption text,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);
create index property_videos_order_idx on public.property_videos(property_id, sort_order, created_at);

alter table public.property_offers enable row level security;
alter table public.property_videos enable row level security;
create policy offers_public_read on public.property_offers for select
using (public.is_staff() or exists (
  select 1 from public.properties p where p.id = property_id and p.publication_status = 'published'
));
create policy offers_staff_write on public.property_offers for all to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy videos_public_read on public.property_videos for select
using (public.is_staff() or exists (
  select 1 from public.properties p where p.id = property_id and p.publication_status = 'published'
));
create policy videos_staff_write on public.property_videos for all to authenticated
using (public.is_staff()) with check (public.is_staff());
grant select on public.property_offers, public.property_videos to anon;
grant select, insert, update, delete on public.property_offers, public.property_videos to authenticated;

-- A MIME-specific route still limits photos to 12 MB; videos are capped at 50 MB.
update storage.buckets set file_size_limit = 52428800,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']
where id = 'property-media';

-- Invoker privileges preserve RLS. Property and offer changes commit together.
create function public.save_property_inventory(property_id uuid, property_payload jsonb, offers_payload jsonb)
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  item public.properties;
  saved_id uuid;
  offer jsonb;
begin
  if not public.is_staff() then raise exception 'Staff access required'; end if;
  if jsonb_typeof(offers_payload) <> 'array' then raise exception 'Offers must be an array'; end if;
  if property_id is null then
    insert into public.properties(
      slug, title, description, location, property_type, land_size_m2,
      created_by, updated_by
    ) values (
      property_payload->>'slug', property_payload->>'title', property_payload->>'description',
      property_payload->>'location', (property_payload->>'property_type')::public.property_type,
      (property_payload->>'land_size_m2')::numeric, auth.uid(), auth.uid()
    ) returning id into saved_id;
  else
    saved_id := property_id;
  end if;
  select * into item from public.properties where id = saved_id for update;
  if not found then raise exception 'Property not found'; end if;
  item := jsonb_populate_record(item, property_payload);
  update public.properties set
    slug=item.slug, title=item.title, short_description=item.short_description, description=item.description,
    property_type=item.property_type, location=item.location, district=item.district, address=item.address,
    latitude=item.latitude, longitude=item.longitude, bedrooms=item.bedrooms, bathrooms=item.bathrooms,
    land_size_m2=item.land_size_m2, building_size_m2=item.building_size_m2, ownership=item.ownership,
    certificate=item.certificate, zoning=item.zoning, lease_expiry=item.lease_expiry,
    features=item.features, amenities=item.amenities, availability_status=item.availability_status,
    publication_status=item.publication_status, published_at=item.published_at, featured=item.featured,
    meta_title=item.meta_title, meta_description=item.meta_description, road_access_m=item.road_access_m,
    frontage_m=item.frontage_m, map_url=item.map_url, views=item.views,
    certificate_count=item.certificate_count, topography=item.topography, updated_by=auth.uid()
  where id = saved_id;
  delete from public.property_offers where property_offers.property_id = saved_id
    and offer_type::text not in (select value->>'offer_type' from jsonb_array_elements(offers_payload));
  for offer in select value from jsonb_array_elements(offers_payload) loop
    insert into public.property_offers(property_id, offer_type, price, currency, price_basis, negotiable, sort_order)
    values (saved_id, (offer->>'offer_type')::public.offer_type, (offer->>'price')::numeric,
      offer->>'currency', (offer->>'price_basis')::public.price_basis,
      coalesce((offer->>'negotiable')::boolean, false), coalesce((offer->>'sort_order')::integer, 0))
    on conflict on constraint property_offers_property_id_offer_type_key do update set
      price=excluded.price, currency=excluded.currency, price_basis=excluded.price_basis,
      negotiable=excluded.negotiable, sort_order=excluded.sort_order;
  end loop;
  if item.publication_status = 'published' then
    if not exists (select 1 from public.property_offers o where o.property_id = saved_id)
      then raise exception 'At least one offer is required before publishing'; end if;
    if not exists (select 1 from public.property_images i where i.property_id = saved_id and i.is_thumbnail)
      then raise exception 'A thumbnail is required before publishing'; end if;
  end if;
  return saved_id;
end;
$$;
revoke all on function public.save_property_inventory(uuid,jsonb,jsonb) from public;
grant execute on function public.save_property_inventory(uuid,jsonb,jsonb) to authenticated;

-- Deferred so replacing offers in a single transaction is valid, while direct
-- staff writes cannot publish or leave a published property without an offer.
create function public.check_published_property_offers()
returns trigger language plpgsql security definer set search_path = public as $$
declare checked_id uuid;
begin
  if tg_table_name = 'properties' then checked_id := new.id;
  elsif tg_op = 'DELETE' then checked_id := old.property_id;
  else checked_id := new.property_id;
  end if;
  if exists (select 1 from public.properties p where p.id = checked_id and p.publication_status = 'published')
    and not exists (select 1 from public.property_offers o where o.property_id = checked_id)
    then raise exception 'Published properties require at least one offer'; end if;
  if tg_table_name = 'property_offers' then
    if tg_op = 'UPDATE' then
      if old.property_id <> new.property_id then
        if exists (select 1 from public.properties p where p.id = old.property_id and p.publication_status = 'published')
          and not exists (select 1 from public.property_offers o where o.property_id = old.property_id)
          then raise exception 'Published properties require at least one offer'; end if;
      end if;
    end if;
  end if;
  return null;
end;
$$;
create constraint trigger properties_require_offers after insert or update on public.properties
deferrable initially deferred for each row execute function public.check_published_property_offers();
create constraint trigger offers_keep_published_valid after insert or update or delete on public.property_offers
deferrable initially deferred for each row execute function public.check_published_property_offers();

-- Reordering is atomic and rejects duplicate, missing, or foreign image IDs.
create function public.reorder_property_videos(property_id uuid, video_ids uuid[])
returns void language plpgsql security invoker set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Staff access required'; end if;
  perform 1 from public.properties p where p.id = property_id for update;
  if cardinality(video_ids) <> (select count(*) from public.property_videos v where v.property_id = reorder_property_videos.property_id)
    or cardinality(video_ids) <> (select count(distinct vid.value) from unnest(video_ids) vid(value))
    or exists (select 1 from unnest(video_ids) vid(value) where not exists (
      select 1 from public.property_videos v where v.id = vid.value and v.property_id = reorder_property_videos.property_id
    )) then raise exception 'Invalid video order'; end if;
  update public.property_videos v set sort_order = ordered.position - 1
  from unnest(video_ids) with ordinality ordered(id, position)
  where v.id = ordered.id and v.property_id = reorder_property_videos.property_id;
end;
$$;
revoke all on function public.reorder_property_videos(uuid,uuid[]) from public;
grant execute on function public.reorder_property_videos(uuid,uuid[]) to authenticated;
commit;
