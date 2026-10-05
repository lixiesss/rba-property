import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import Module from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

function loadTs(file) {
  const filename = path.resolve(file);
  const instance = new Module(filename);
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = instance.require.bind(instance);
  instance.require = specifier => specifier.startsWith(".")
    ? loadTs(path.resolve(path.dirname(filename), `${specifier}.ts`)) : originalRequire(specifier);
  instance._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return instance.exports;
}
const { localizedPath, translationReady } = loadTs("lib/i18n/config.ts");
const { localizedContent } = loadTs("lib/i18n/property-content.ts");
const { localeMetadata } = loadTs("lib/i18n/metadata.ts");
const { parseLocalizedPropertyForm } = loadTs("lib/validation/property.ts");

test("locale routes preserve canonical filters, slug and fragment", () => {
  assert.equal(localizedPath("/id/properties/same-slug?type=land&listing=sale#inquiry", "en"), "/en/properties/same-slug?type=land&listing=sale#inquiry");
  assert.equal(localizedPath("/", "id"), "/id");
  for (const value of ["/admin/properties", "/api/inquiries", "https://example.com", "mailto:a@example.com"]) assert.equal(localizedPath(value, "en"), value);
});
test("property text resolves fields independently in either language, then legacy", () => {
  const id = { locale: "id", title: "Tanah", short_description: "Ringkasan", description: "Deskripsi" };
  const en = { locale: "en", title: "Land", short_description: "Summary", description: "Description", meta_title: "English SEO", meta_description: "English meta" };
  assert.equal(translationReady(id), true);
  assert.equal(translationReady({ ...id, description: "  " }), false);
  assert.equal(localizedContent([id], "en").title, "Tanah");
  assert.equal(localizedContent([en], "id").title, "Land");
  const mixed = localizedContent([{ ...id, description: " " }, en], "id");
  assert.equal(mixed.title, "Tanah");
  assert.equal(mixed.description, "Description");
  assert.equal(mixed.meta_title, "English SEO");
  assert.equal(localizedContent([en, id], "id").description, "Deskripsi");
  assert.equal(localizedContent([id, { ...en, title: "" }], "en").title, "Tanah");
  for (const locale of ["id", "en"]) {
    const legacy = localizedContent([], locale, { title: "Legacy title", description: "Legacy description" });
    assert.equal(legacy.title, "Legacy title");
    assert.equal(legacy.description, "Legacy description");
    assert.notEqual(localizedContent([], locale), null, "missing text never denies public existence");
  }
  assert.equal(id.title, "Tanah", "fallback does not mutate stored content");
});
test("fallback SEO canonicalizes to actual content language and omits false ID hreflang", () => {
  const fallback = localeMetadata("en", "/properties/same-slug", "Land", "Description", ["en"]);
  assert.equal(fallback.alternates.canonical, "/en/properties/same-slug");
  assert.deepEqual(fallback.alternates.languages, { en: "/en/properties/same-slug" });
  const complete = localeMetadata("id", "/properties/same-slug", "Tanah", "Deskripsi", ["id", "en"]);
  assert.equal(complete.alternates.canonical, "/id/properties/same-slug");
  assert.equal(complete.alternates.languages.id, "/id/properties/same-slug");
});
test("draft validation accepts independent incomplete content and preserves canonical facts", () => {
  const data = new FormData();
  for (const [key, value] of Object.entries({ slug: "draft-land", property_type: "land", location: "Ubud", land_size_value: "4", land_size_unit: "are", availability_status: "available", id_title: "Tanah Ubud" })) data.set(key, value);
  const result = parseLocalizedPropertyForm(data);
  assert.equal(result.success, true);
  assert.equal(result.data.land_size_m2, 400);
  assert.equal(result.data.translations[0].title, "Tanah Ubud");
  assert.equal(result.data.translations[1].title, "");
  assert.equal("title" in result.data, false, "legacy content is not an application write source");
});

test("Land and Villa drafts accept missing location without placeholder values", () => {
  for (const type of ["land", "villa"]) {
    for (const location of ["", "   ", null]) {
      const data = new FormData();
      for (const [key, value] of Object.entries({ slug: `draft-${type}`, property_type: type, land_size_value: "400", land_size_unit: "m2", availability_status: "available" })) data.set(key, value);
      if (location !== null) data.set("location", location);
      const parsed = parseLocalizedPropertyForm(data);
      assert.equal(parsed.success, true);
      assert.equal(parsed.data.location, null);
      assert.equal(parsed.data.offers.length, 0);
    }
  }
});

test("translation migration backfill, atomic saves, locale readiness and RLS", { skip: !process.env.RBA_PGLITE_MODULE }, async () => {
  const { PGlite } = await import(pathToFileURL(process.env.RBA_PGLITE_MODULE).href);
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        'select nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid';
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid default gen_random_uuid(),bucket_id text);
      grant usage on schema auth,storage to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;`);
    await db.exec(readFileSync("supabase/migrations/202609280001_initial_cms.sql", "utf8").replace("create extension if not exists pgcrypto;", ""));
    await db.exec(readFileSync("supabase/seed.sql", "utf8").split("-- Inventory offers:")[0]);
    await db.exec(readFileSync("supabase/migrations/202610010001_inventory_offers_videos.sql", "utf8"));
    await db.exec(readFileSync("supabase/migrations/202610010002_property_translations.sql", "utf8"));
    await db.exec(readFileSync("supabase/migrations/202610020001_translation_public_read.sql", "utf8"));
    await db.exec("update properties set publication_status='published',published_at=now()");
    const existingInventory = (await db.query("select * from properties order by id")).rows;
    await db.exec(readFileSync("supabase/migrations/202610050001_draft_optional_location.sql", "utf8"));
    assert.deepEqual((await db.query("select * from properties order by id")).rows, existingInventory, "location migration leaves existing inventory untouched");
    assert.equal((await db.query("select count(*)::int as n from property_translations where locale='id'")).rows[0].n, 0);
    assert.equal((await db.query("select count(*)::int as n from property_translations t join properties p on p.id=t.property_id where t.locale='en' and t.title=p.title")).rows[0].n, 3);
    await db.exec(`insert into auth.users values ('20000000-0000-4000-8000-000000000001');
      insert into profiles(id,role) values ('20000000-0000-4000-8000-000000000001','editor');
      grant select,insert,update,delete on all tables in schema public to authenticated;
      grant select on properties,property_images,site_settings to anon;
      set role authenticated; set request.jwt.claim.sub='20000000-0000-4000-8000-000000000001';`);
    const payload = { slug: "localized-land", location: "Uluwatu", property_type: "land", land_size_m2: 400, publication_status: "draft" };
    const offers = [{ offer_type: "sale", price: 260000000, currency: "IDR", price_basis: "per_are", sort_order: 0 }];
    const translations = [{ locale: "id", title: "Tanah Uluwatu", short_description: "Tanah pilihan", description: "Deskripsi tanah Uluwatu" }, { locale: "en", title: "", short_description: "", description: "" }];
    const save = (id, values, content = translations) => db.query("select save_localized_property_inventory($1,$2::jsonb,$3::jsonb,$4::jsonb) as id", [id, JSON.stringify(values), JSON.stringify(offers), JSON.stringify(content)]);
    for (const type of ["land", "villa"]) {
      const draft = { ...payload, slug: `missing-location-${type}`, property_type: type, location: null };
      const emptyContent = ["id", "en"].map(locale => ({ locale, title: "", short_description: "", description: "" }));
      const result = await db.query("select save_localized_property_inventory(null,$1::jsonb,'[]'::jsonb,$2::jsonb) as id", [JSON.stringify(draft), JSON.stringify(emptyContent)]);
      const draftId = result.rows[0].id;
      assert.equal((await db.query("select location from properties where id=$1", [draftId])).rows[0].location, null);
      await save(draftId, { ...draft, location: "Ubud" });
      await save(draftId, draft);
      assert.equal((await db.query("select location from properties where id=$1", [draftId])).rows[0].location, null, "clearing existing draft location persists NULL");
      await db.query("insert into property_images(property_id,storage_path,is_thumbnail) values ($1,$2,true)", [draftId, `draft-location/${type}.webp`]);
      for (const location of [null, "", "   "]) {
        await assert.rejects(save(draftId, { ...draft, location, publication_status: "published", published_at: new Date().toISOString() }), /published_requires_location/);
      }
      assert.equal((await db.query("select publication_status from properties where id=$1", [draftId])).rows[0].publication_status, "draft");
      await save(draftId, { ...draft, location: "Ubud", publication_status: "published", published_at: new Date().toISOString() });
      assert.equal((await db.query("select publication_status from properties where id=$1", [draftId])).rows[0].publication_status, "published");
      await assert.rejects(save(draftId, { location: null }), /published_requires_location/, "published saves must retain location");
    }
    const id = (await save(null, payload)).rows[0].id;
    await db.query("insert into property_images(property_id,storage_path,is_thumbnail) values ($1,'localization/photo.webp',true)", [id]);
    await db.query("insert into property_videos(property_id,storage_path) values ($1,'localization/video.mp4')", [id]);
    const snapshot = async () => (await db.query("select id,storage_path,is_thumbnail,sort_order from property_images where property_id=$1", [id])).rows;
    const before = await snapshot();
    await db.exec("reset role; alter table property_translations add constraint translation_rollback_probe check(title <> 'Rollback probe'); set role authenticated;");
    await assert.rejects(save(id, { ...payload, location: "Must roll back" }, [translations[0], { ...translations[1], title: "Rollback probe" }]));
    assert.equal((await db.query("select location from properties where id=$1", [id])).rows[0].location, "Uluwatu", "translation failure rolls back shared inventory");
    await db.exec("reset role; set request.jwt.claim.sub=''; set role anon;");
    assert.equal((await db.query("select * from property_translations where property_id=$1", [id])).rows.length, 0, "draft is private");
    await assert.rejects(db.query("insert into property_translations(property_id,locale) values ($1,'en')", [id]));
    await db.exec("reset role; set role authenticated;");
    await assert.rejects(save(id, payload), "nonstaff cannot save");
    await db.exec("set request.jwt.claim.sub='20000000-0000-4000-8000-000000000001';");
    await save(id, { ...payload, publication_status: "published", published_at: new Date().toISOString() });
    await db.exec("reset role; set request.jwt.claim.sub=''; set role anon;");
    assert.deepEqual((await db.query("select locale from property_translations where property_id=$1 order by locale", [id])).rows.map(row => row.locale), ["en", "id"], "published translations are readable even when incomplete");
    await assert.rejects(db.query("update property_translations set title='Unauthorized' where property_id=$1", [id]));
    await assert.rejects(db.query("delete from property_translations where property_id=$1", [id]));
    await db.exec("reset role; set role authenticated; set request.jwt.claim.sub='20000000-0000-4000-8000-000000000001';");
    const ready = [translations[0], { locale: "en", title: "Uluwatu Land", short_description: "Selected land", description: "Uluwatu land description" }];
    const published = { ...payload, publication_status: "published", published_at: new Date().toISOString() };
    await save(id, published, ready);
    assert.deepEqual(await snapshot(), before, "localized saves preserve media identity and order");
    assert.equal((await db.query("select count(*)::int as n from property_offers where property_id=$1", [id])).rows[0].n, 1);
    assert.equal((await db.query("select count(*)::int as n from property_videos where property_id=$1", [id])).rows[0].n, 1);
    await assert.rejects(db.query("select save_localized_property_inventory($1,$2::jsonb,$3::jsonb,$4::jsonb)", [id, JSON.stringify({ ...published, location: "Must roll back" }), JSON.stringify([{ ...offers[0], price: -1 }]), JSON.stringify(ready)]));
    await assert.rejects(save(id, { ...payload, location: "Must roll back" }, [ready[0], { ...ready[1], locale: "fr" }]));
    assert.equal((await db.query("select location from properties where id=$1", [id])).rows[0].location, "Uluwatu");
    await db.exec("reset role; set request.jwt.claim.sub=''; set role anon;");
    assert.equal((await db.query("select * from property_translations where property_id=$1", [id])).rows.length, 2);
    await db.exec("reset role; set role authenticated; set request.jwt.claim.sub='20000000-0000-4000-8000-000000000001';");
    await save(id, published, [{ locale: "id", title: "", short_description: "", description: "" }, { locale: "en", title: "", short_description: "", description: "" }]);
    await db.exec("reset role; set request.jwt.claim.sub=''; set role anon;");
    assert.equal((await db.query("select id from properties where id=$1", [id])).rows.length, 1, "published property remains accessible with no translation content");
    assert.equal((await db.query("select * from property_translations where property_id=$1", [id])).rows.length, 2, "empty translations remain public for a published parent");
    await db.exec("reset role; set role authenticated; set request.jwt.claim.sub='20000000-0000-4000-8000-000000000001';");
    await save(id, published, [
      { locale: "id", title: "Tanah Tegallalang", short_description: "", description: "" },
      { locale: "en", title: "Tegallalang Land", short_description: "", description: "English description" },
    ]);
    await db.exec("reset role; set request.jwt.claim.sub=''; set role anon;");
    // The unchanged schema stores missing description as ''. Project it as NULL to
    // exercise the exact nullable input case through the anonymous read/resolver boundary.
    const readContent = async () => (await db.query("select locale,title,short_description,nullif(description,'') as description from property_translations where property_id=$1", [id])).rows;
    const partial = await readContent();
    assert.equal(partial.find(row => row.locale === "id").description, null);
    assert.equal(localizedContent(partial, "id").title, "Tanah Tegallalang");
    assert.equal(localizedContent(partial, "id").description, "English description");
    assert.equal(localizedContent(partial, "en").title, "Tegallalang Land");
    assert.equal(localizedContent(partial, "en").description, "English description");
    await db.exec("reset role; set role authenticated; set request.jwt.claim.sub='20000000-0000-4000-8000-000000000001';");
    await db.query("update property_translations set description='Deskripsi Indonesia' where property_id=$1 and locale='id'", [id]);
    await db.exec("reset role; set request.jwt.claim.sub=''; set role anon;");
    assert.equal(localizedContent(await readContent(), "id").description, "Deskripsi Indonesia");
    assert.equal((await readContent()).length, 2, "read-time fallback creates no rows");
    for (const status of ["draft", "archived"]) {
      await db.exec("reset role; set role authenticated; set request.jwt.claim.sub='20000000-0000-4000-8000-000000000001';");
      await save(id, { ...payload, publication_status: status });
      await db.exec("reset role; set request.jwt.claim.sub=''; set role anon;");
      assert.equal((await db.query("select id from properties where id=$1", [id])).rows.length, 0, `${status} remains private`);
      assert.equal((await db.query("select * from property_translations where property_id=$1", [id])).rows.length, 0, `${status} translations remain private`);
    }
    await db.exec("reset role; set request.jwt.claim.sub='';");
    assert.deepEqual((await db.query("select * from properties where id=any($1::uuid[]) order by id", [existingInventory.map(row => row.id)])).rows, existingInventory, "existing published inventory remains unchanged");
  } finally { await db.close(); }
});
