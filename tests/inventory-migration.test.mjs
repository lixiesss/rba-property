import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Set RBA_PGLITE_MODULE to a temporary @electric-sql/pglite dist/index.js.
test("inventory migration, transactional offers, and RLS", { skip: !process.env.RBA_PGLITE_MODULE }, async () => {
  const { PGlite } = await import(pathToFileURL(process.env.RBA_PGLITE_MODULE).href);
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth; create schema storage;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        'select nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid';
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid default gen_random_uuid(),bucket_id text);
      grant usage on schema auth,storage to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;
    `);
    await db.exec(readFileSync("supabase/migrations/202609280001_initial_cms.sql","utf8").replace("create extension if not exists pgcrypto;",""));
    await db.exec(readFileSync("supabase/seed.sql","utf8").split("-- Inventory offers:")[0]);
    await db.exec("update properties set title='Test Villa Uluwatu',slug='testvillauwt' where id='10000000-0000-4000-8000-000000000001'");
    await db.exec(readFileSync("supabase/migrations/202610010001_inventory_offers_videos.sql","utf8"));
    await db.exec("update properties set publication_status='published',published_at=now()");
    assert.equal((await db.query("select count(*)::int as count from property_offers")).rows[0].count,3);
    assert.equal((await db.query("select o.price::text as price from properties p join property_offers o on o.property_id=p.id where p.slug='testvillauwt'")).rows[0].price,"18500000000.00");
    await db.exec(`
      insert into auth.users values ('20000000-0000-4000-8000-000000000001');
      insert into profiles(id,role) values ('20000000-0000-4000-8000-000000000001','editor');
      grant select,insert,update,delete on all tables in schema public to authenticated;
      grant select on properties,property_images,site_settings to anon;
      set role authenticated;
      set request.jwt.claim.sub='20000000-0000-4000-8000-000000000001';
    `);
    const payload = { title:"Land regression",slug:"land-regression",description:"Complete regression description.",location:"Uluwatu",property_type:"land",land_size_m2:400,publication_status:"draft" };
    const sale = { offer_type:"sale",price:260000000,currency:"IDR",price_basis:"per_are",negotiable:true,sort_order:0 };
    const lease = { offer_type:"lease",price:5000000,currency:"IDR",price_basis:"per_are_per_year",negotiable:false,sort_order:1 };
    const saved = await db.query("select save_property_inventory(null,$1::jsonb,$2::jsonb) as id",[JSON.stringify(payload),JSON.stringify([sale,lease])]);
    const id = saved.rows[0].id;
    await assert.rejects(db.exec("delete from property_offers where property_id='10000000-0000-4000-8000-000000000001'"));
    assert.equal((await db.query("select count(*)::int as count from property_offers where property_id=$1",[id])).rows[0].count,2);
    await assert.rejects(db.query("select save_property_inventory($1,$2::jsonb,$3::jsonb)",[id,JSON.stringify({...payload,title:"Must roll back"}),JSON.stringify([{...sale,price:-1}])]));
    assert.equal((await db.query("select title from properties where id=$1",[id])).rows[0].title,"Land regression");
    await assert.rejects(db.query("select save_property_inventory($1,$2::jsonb,$3::jsonb)",[id,JSON.stringify({...payload,publication_status:"published",published_at:new Date().toISOString()}),JSON.stringify([])]));
    await db.query("select save_property_inventory($1,$2::jsonb,$3::jsonb)",[id,JSON.stringify(payload),JSON.stringify([lease])]);
    assert.equal((await db.query("select offer_type from property_offers where property_id=$1",[id])).rows[0].offer_type,"lease");
    await db.query("insert into property_videos(property_id,storage_path) values ($1,'test/a.mp4'),($1,'test/b.webm')",[id]);
    const ids = (await db.query("select id from property_videos where property_id=$1 order by storage_path",[id])).rows.map(row=>row.id);
    await db.query("select reorder_property_videos($1,$2::uuid[])",[id,[...ids].reverse()]);
    assert.equal((await db.query("select id from property_videos where property_id=$1 order by sort_order",[id])).rows[0].id,ids[1]);
    await assert.rejects(db.query("select reorder_property_videos($1,$2::uuid[])",[id,[ids[0],ids[0]]]));
    const { rows: photoRows } = await db.query("select id from property_images where property_id='10000000-0000-4000-8000-000000000001'");
    await db.exec("insert into property_images(property_id,storage_path,alt_text,sort_order) values ('10000000-0000-4000-8000-000000000001','regression/photo.webp','Regression photo',1)");
    await db.exec("update property_images set is_thumbnail=true where storage_path='regression/photo.webp'");
    assert.equal((await db.query("select count(*)::int as count from property_images where property_id='10000000-0000-4000-8000-000000000001' and is_thumbnail")).rows[0].count,1);
    await db.query("update property_images set sort_order=2 where id=$1",[photoRows[0].id]);
    const propertyId = "10000000-0000-4000-8000-000000000001";
    await db.query("insert into property_videos(property_id,storage_path,title,sort_order) values ($1,'regression/save-preserves.mp4','Regression video',0)",[propertyId]);
    const mediaSnapshot = async () => ({
      photos: (await db.query("select * from property_images where property_id=$1 order by sort_order,id",[propertyId])).rows,
      videos: (await db.query("select * from property_videos where property_id=$1 order by sort_order,id",[propertyId])).rows,
    });
    const offers = (await db.query("select * from property_offers where property_id=$1 order by sort_order",[propertyId])).rows;
    const beforeSave = await mediaSnapshot();
    await db.query("select save_property_inventory($1,$2::jsonb,$3::jsonb)",[propertyId,JSON.stringify({description:"Description-only save preserves existing media."}),JSON.stringify(offers)]);
    assert.deepEqual(await mediaSnapshot(),beforeSave,"field saves must preserve every media row, identity, path, thumbnail and order");
    await db.query("update property_images set sort_order=3 where id=$1",[photoRows[0].id]);
    const reordered = await mediaSnapshot();
    await db.query("select save_property_inventory($1,$2::jsonb,$3::jsonb)",[propertyId,JSON.stringify({availability_status:"reserved"}),JSON.stringify(offers)]);
    assert.deepEqual(await mediaSnapshot(),reordered,"unrelated saves must preserve persisted gallery ordering");
    await db.exec("update site_settings set company_email='contact@example.test' where id=true");
    await db.exec("insert into inquiries(name,email,message) values ('Regression contact','lead@example.test','Property regression inquiry')");
    await db.exec("update inquiries set status='contacted',admin_notes='Regression check' where email='lead@example.test'");
    await db.exec("update properties set availability_status='reserved',updated_by=auth.uid() where slug='testvillauwt'");
    await db.exec("reset role; set request.jwt.claim.sub=''; set role anon;");
    assert.equal((await db.query("select count(*)::int as count from property_offers")).rows[0].count,3);
    assert.equal((await db.query("select count(*)::int as count from property_videos")).rows[0].count,1);
    assert.equal((await db.query("select availability_status from properties where slug='testvillauwt'")).rows[0].availability_status,"reserved");
    assert.equal((await db.query("select company_email from site_settings")).rows[0].company_email,"contact@example.test");
    await assert.rejects(db.query("insert into property_offers(property_id,offer_type,price,currency) values ($1,'sale',10,'IDR')",[id]));
  } finally { await db.close(); }
});
