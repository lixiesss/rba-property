create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'editor');
create type public.listing_type as enum ('sale', 'lease');
create type public.property_type as enum ('villa', 'land', 'investment');
create type public.publication_status as enum ('draft', 'published', 'archived');
create type public.availability_status as enum ('available', 'under_offer', 'reserved', 'sold');
create type public.inquiry_status as enum ('new', 'contacted', 'qualified', 'closed', 'spam');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  short_description text not null default '',
  description text not null default '',
  listing_type public.listing_type not null,
  property_type public.property_type not null,
  location text not null,
  district text not null default '',
  address text,
  latitude numeric(9,6) check (latitude between -90 and 90),
  longitude numeric(9,6) check (longitude between -180 and 180),
  price numeric(18,2) not null check (price >= 0),
  currency char(3) not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  bedrooms smallint check (bedrooms >= 0),
  bathrooms smallint check (bathrooms >= 0),
  land_size_m2 numeric(12,2) not null check (land_size_m2 > 0),
  building_size_m2 numeric(12,2) check (building_size_m2 >= 0),
  ownership text,
  lease_expiry date,
  certificate text,
  zoning text,
  features text[] not null default '{}',
  amenities text[] not null default '{}',
  availability_status public.availability_status not null default 'available',
  publication_status public.publication_status not null default 'draft',
  featured boolean not null default false,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  constraint published_requires_timestamp check (publication_status <> 'published' or published_at is not null)
);

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null default '',
  caption text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_thumbnail boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index property_images_one_thumbnail
  on public.property_images(property_id) where is_thumbnail;
create index property_images_order_idx on public.property_images(property_id, sort_order, created_at);
create index properties_public_idx on public.properties(publication_status, featured, updated_at desc);
create index properties_filters_idx on public.properties(property_type, listing_type, availability_status, location);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  name text not null,
  email text,
  phone text,
  message text not null,
  source text not null default 'property_detail',
  status public.inquiry_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiry_contact_required check (nullif(trim(email), '') is not null or nullif(trim(phone), '') is not null)
);

create index inquiries_status_created_idx on public.inquiries(status, created_at desc);

create table public.site_settings (
  id boolean primary key default true check (id),
  company_email text,
  whatsapp text,
  phone text,
  office_address text,
  instagram text,
  linkedin text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

insert into public.site_settings(id) values (true) on conflict do nothing;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger properties_set_updated_at before update on public.properties
for each row execute function public.set_updated_at();
create trigger inquiries_set_updated_at before update on public.inquiries
for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.enforce_property_thumbnail()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_thumbnail then
    update public.property_images
      set is_thumbnail = false
      where property_id = new.property_id and id <> new.id and is_thumbnail;
  elsif tg_op = 'INSERT' and not exists (
    select 1 from public.property_images where property_id = new.property_id and is_thumbnail
  ) then
    new.is_thumbnail = true;
  end if;
  return new;
end;
$$;

create trigger property_images_enforce_thumbnail
before insert or update of is_thumbnail on public.property_images
for each row execute function public.enforce_property_thumbnail();

create or replace function public.replace_deleted_thumbnail()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.is_thumbnail then
    update public.property_images set is_thumbnail = true
    where id = (
      select id from public.property_images
      where property_id = old.property_id
      order by sort_order, created_at
      limit 1
    );
  end if;
  return old;
end;
$$;

create trigger property_images_replace_thumbnail
after delete on public.property_images
for each row execute function public.replace_deleted_thumbnail();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;

create policy "profiles_self_read" on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_write" on public.profiles for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "published_properties_public_read" on public.properties for select
using (publication_status = 'published' or public.is_staff());
create policy "staff_create_properties" on public.properties for insert to authenticated
with check (public.is_staff() and created_by = auth.uid() and updated_by = auth.uid());
create policy "staff_update_properties" on public.properties for update to authenticated
using (public.is_staff()) with check (public.is_staff() and updated_by = auth.uid());
create policy "staff_delete_properties" on public.properties for delete to authenticated
using (public.is_admin());

create policy "published_property_images_public_read" on public.property_images for select
using (
  public.is_staff() or exists (
    select 1 from public.properties p
    where p.id = property_id and p.publication_status = 'published'
  )
);
create policy "staff_manage_property_images" on public.property_images for all to authenticated
using (public.is_staff()) with check (public.is_staff());

create policy "public_create_inquiries" on public.inquiries for insert to anon, authenticated
with check (status = 'new' and admin_notes is null);
create policy "staff_read_inquiries" on public.inquiries for select to authenticated
using (public.is_staff());
create policy "staff_update_inquiries" on public.inquiries for update to authenticated
using (public.is_staff()) with check (public.is_staff());

create policy "site_settings_public_read" on public.site_settings for select using (true);
create policy "staff_update_site_settings" on public.site_settings for update to authenticated
using (public.is_staff()) with check (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-media',
  'property-media',
  true,
  12582912,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "property_media_public_read" on storage.objects for select
using (bucket_id = 'property-media');
create policy "property_media_staff_insert" on storage.objects for insert to authenticated
with check (bucket_id = 'property-media' and public.is_staff());
create policy "property_media_staff_update" on storage.objects for update to authenticated
using (bucket_id = 'property-media' and public.is_staff())
with check (bucket_id = 'property-media' and public.is_staff());
create policy "property_media_staff_delete" on storage.objects for delete to authenticated
using (bucket_id = 'property-media' and public.is_staff());

revoke all on function public.is_staff() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
