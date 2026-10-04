begin;
create table public.property_translations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  locale text not null check (locale in ('id', 'en')),
  title text not null default '',
  short_description text not null default '',
  description text not null default '',
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, locale)
);
create trigger property_translations_updated before update on public.property_translations
for each row execute function public.set_updated_at();
insert into public.property_translations(property_id,locale,title,short_description,description,meta_title,meta_description)
select id,'en',title,short_description,description,meta_title,meta_description from public.properties;
comment on column public.properties.title is 'Deprecated compatibility field: application content lives in property_translations';
comment on column public.properties.short_description is 'Deprecated: use property_translations';
comment on column public.properties.description is 'Deprecated: use property_translations';
comment on column public.properties.meta_title is 'Deprecated: use property_translations';
comment on column public.properties.meta_description is 'Deprecated: use property_translations';

alter table public.property_translations enable row level security;
create policy translations_public_read on public.property_translations for select
using (public.is_staff() or (
  length(btrim(title)) > 0 and length(btrim(short_description)) > 0 and length(btrim(description)) > 0
  and exists (select 1 from public.properties p where p.id=property_id and p.publication_status='published')
));
create policy translations_staff_write on public.property_translations for all to authenticated
using (public.is_staff()) with check (public.is_staff());
grant select on public.property_translations to anon;
grant select,insert,update,delete on public.property_translations to authenticated;

-- Extend the existing inventory transaction; shared offers/media stay single-copy.
create function public.save_localized_property_inventory(property_id uuid, property_payload jsonb, offers_payload jsonb, translations_payload jsonb)
returns uuid language plpgsql security invoker set search_path=public as $$
declare saved_id uuid; content jsonb; compatibility jsonb;
begin
  if not public.is_staff() then raise exception 'Staff access required'; end if;
  if jsonb_typeof(translations_payload) is distinct from 'array' or jsonb_array_length(translations_payload) <> 2
    then raise exception 'Both translation records must be supplied'; end if;
  if (select count(distinct value->>'locale') from jsonb_array_elements(translations_payload) where value->>'locale' in ('id','en')) <> 2
    then raise exception 'Translations must contain id and en exactly once'; end if;
  -- Legacy columns are compatibility mirrors, never a public language fallback.
  select value into compatibility from jsonb_array_elements(translations_payload)
  order by (length(btrim(coalesce(value->>'title',''))) > 0) desc, (value->>'locale'='en') desc limit 1;
  saved_id := public.save_property_inventory(property_id, property_payload || jsonb_build_object(
    'title',coalesce(compatibility->>'title',''), 'short_description',coalesce(compatibility->>'short_description',''),
    'description',coalesce(compatibility->>'description',''), 'meta_title',compatibility->>'meta_title', 'meta_description',compatibility->>'meta_description'
  ),offers_payload);
  for content in select value from jsonb_array_elements(translations_payload) loop
    insert into public.property_translations(property_id,locale,title,short_description,description,meta_title,meta_description)
    values (saved_id,content->>'locale',coalesce(content->>'title',''),coalesce(content->>'short_description',''),
      coalesce(content->>'description',''),nullif(content->>'meta_title',''),nullif(content->>'meta_description',''))
    on conflict on constraint property_translations_property_id_locale_key do update set
      title=excluded.title,short_description=excluded.short_description,description=excluded.description,
      meta_title=excluded.meta_title,meta_description=excluded.meta_description;
  end loop;
  return saved_id;
end;
$$;
revoke all on function public.save_localized_property_inventory(uuid,jsonb,jsonb,jsonb) from public;
grant execute on function public.save_localized_property_inventory(uuid,jsonb,jsonb,jsonb) to authenticated;
commit;
