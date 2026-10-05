begin;
alter table public.properties add column market_area text;
create index properties_market_area_idx on public.properties(market_area);

-- Classify only one unambiguous named market; Gianyar yields to its submarkets.
with candidates as (
  select p.id, array_agg(a.key) as keys from public.properties p
  cross join (values
    ('ubud','\mubud\M'), ('tegallalang','\m(tegallalang|ceking|kenderan|manuaba)\M'),
    ('canggu','\mcanggu\M'), ('pererenan','\mpererenan\M'), ('uluwatu','\muluwatu\M'),
    ('seminyak','\mseminyak\M'), ('sanur','\msanur\M'), ('tabanan','\mtabanan\M'),
    ('gianyar','\mgianyar\M')
  ) a(key,pattern)
  where p.market_area is null and p.location ~* a.pattern
  group by p.id
), resolved as (
  select id, case when cardinality(keys)>1 then array_remove(keys,'gianyar') else keys end as keys from candidates
)
update public.properties p set market_area=r.keys[1]
from resolved r where p.id=r.id and p.market_area is null and cardinality(r.keys)=1;

-- Extend the existing save transaction without changing offers, media or translations.
create function public.save_property_market_inventory(property_id uuid, property_payload jsonb, offers_payload jsonb, translations_payload jsonb)
returns uuid language plpgsql security invoker set search_path=public as $$
declare saved_id uuid;
begin
  if not public.is_staff() then raise exception 'Staff access required'; end if;
  saved_id := public.save_localized_property_inventory(property_id,property_payload,offers_payload,translations_payload);
  if property_payload ? 'market_area' then
    update public.properties set market_area=nullif(property_payload->>'market_area','') where id=saved_id;
  end if;
  return saved_id;
end;
$$;
revoke all on function public.save_property_market_inventory(uuid,jsonb,jsonb,jsonb) from public;
grant execute on function public.save_property_market_inventory(uuid,jsonb,jsonb,jsonb) to authenticated;
commit;
