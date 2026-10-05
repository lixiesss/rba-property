begin;

alter table public.properties alter column location drop not null;

-- Preserve publication safety without rewriting or rejecting existing inventory.
alter table public.properties add constraint published_requires_location
check (publication_status <> 'published' or nullif(btrim(location), '') is not null)
not valid;

commit;
