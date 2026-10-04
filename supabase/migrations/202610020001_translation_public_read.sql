begin;

-- Translation fields affect presentation, not authorization to published content.
alter policy translations_public_read on public.property_translations
using (
  public.is_staff()
  or exists (
    select 1 from public.properties p
    where p.id = property_id and p.publication_status = 'published'
  )
);

commit;
