import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import Module from "node:module";
import path from "node:path";
import ts from "typescript";

function loadTs(file) {
  const filename = path.resolve(file);
  const instance = new Module(filename);
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  instance._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return instance.exports;
}

const { parsePropertyForm, propertyFormSchema } = loadTs("lib/validation/property.ts");
const { mapOffers, offersLabel, formatOffer } = loadTs("lib/offers.ts");
const { parsePrice, matchesPrice } = loadTs("lib/property-filters.ts");

test("price query parsing rejects malformed, negative and unsafe amounts", () => {
  for (const value of [undefined,"","-1","NaN","1e9","10,000","Infinity","9007199254740992"]) assert.equal(parsePrice(value),undefined);
  assert.equal(parsePrice("0"),0);
  assert.equal(parsePrice("260000000"),260000000);
  assert.equal(parsePrice("12.50"),12.5);
});

test("price filters compare one matching IDR offer and never mix price bases", () => {
  const offers = [
    {offerType:"sale",price:260000000,currency:"IDR",priceBasis:"per_are"},
    {offerType:"lease",price:5000000,currency:"IDR",priceBasis:"per_are_per_year"},
    {offerType:"sale",price:8500000000,currency:"IDR",priceBasis:"global"},
  ];
  assert.equal(matchesPrice(offers,{}),true);
  assert.equal(matchesPrice(offers,{maxPrice:300000000}),false);
  assert.equal(matchesPrice(offers,{maxPrice:300000000,priceBasis:"per_are"}),true);
  assert.equal(matchesPrice(offers,{minPrice:5000000,maxPrice:5000000,priceBasis:"per_are_per_year",listingType:"lease"}),true);
  assert.equal(matchesPrice(offers,{maxPrice:300000000,priceBasis:"per_are",listingType:"lease"}),false);
  assert.equal(matchesPrice(offers,{minPrice:100,maxPrice:10}),false);
  assert.equal(matchesPrice([{...offers[2],currency:"USD"}],{minPrice:1}),false);
  assert.equal(matchesPrice([offers[0],offers[1]],{minPrice:10000000,maxPrice:250000000,priceBasis:"per_are"}),false);
});
function form(types, basis = "global", unit = "m2", size = "400") {
  const data = new FormData();
  for (const [key,value] of Object.entries({
    title:"Inventory test",slug:"inventory-test",description:"A complete property description.",
    property_type:"land",location:"Uluwatu",land_size_value:size,land_size_unit:unit,
    availability_status:"available",views:"Rice field\nOcean, Custom valley",
  })) data.set(key,value);
  for (const type of types) {
    data.set(type+"_enabled","on");data.set(type+"_price",type === "sale" ? "260000000" : "5000000");
    data.set(type+"_currency","IDR");data.set(type+"_basis",basis);
  }
  return data;
}

for (const [label,types,basis,expected] of [
  ["sale only",["sale"],"global","Sale"],
  ["lease only",["lease"],"global","Lease"],
  ["sale and lease",["sale","lease"],"global","Sale & Lease"],
  ["land per are",["sale"],"per_are","Sale"],
  ["lease per are per year",["lease"],"per_are_per_year","Lease"],
]) test(label, () => {
  const parsed = parsePropertyForm(form(types,basis));
  assert.equal(parsed.success,true);
  const offers = mapOffers(parsed.data.offers);
  assert.equal(offersLabel(offers),expected);
  assert.equal(offers.length,types.length);
  assert.equal(offers[0].priceBasis,basis);
  assert.equal(parsed.data.bedrooms,null);
  assert.equal(parsed.data.building_size_m2,null);
  assert.deepEqual(parsed.data.views,["Rice field","Ocean","Custom valley"]);
});

test("units convert to the same canonical m2", () => {
  for(const [unit,size] of [["m2","400"],["are","4"],["ha","0.04"]]) {
    assert.equal(parsePropertyForm(form(["sale"],"global",unit,size)).data.land_size_m2,400);
  }
  assert.equal(parsePropertyForm(form(["sale"],"global","acre","4")).success,false);
});
test("price basis labels", () => {
  const base = { offerType:"sale",price:260000000,currency:"IDR",priceBasis:"per_are",negotiable:false,sortOrder:0 };
  assert.equal(formatOffer(base),"IDR 260,000,000 / are");
  assert.equal(formatOffer({...base,offerType:"lease",price:5000000,priceBasis:"per_are_per_year"}),"IDR 5,000,000 / are / year");
  assert.equal(formatOffer({...base,price:8000000000,priceBasis:"global"}),"IDR 8,000,000,000");
});
test("invalid offers, maps, and nullable field clearing", () => {
  assert.equal(parsePropertyForm(form(["sale"],"per_are_per_year")).success,false);
  const negative = form(["sale"]);negative.set("sale_price","-1");
  assert.equal(parsePropertyForm(negative).success,false);
  const blank = form(["sale"]);blank.set("sale_price","");
  assert.equal(parsePropertyForm(blank).success,false);
  const badMap = form(["sale"]);badMap.set("map_url","javascript:alert(1)");
  assert.equal(parsePropertyForm(badMap).success,false);
  const valid = form(["sale"]);valid.set("map_url","https://maps.app.goo.gl/example");
  const parsed = parsePropertyForm(valid);
  assert.equal(parsed.success,true);
  assert.equal(parsed.data.frontage_m,null);
  assert.equal(parsed.data.certificate_count,null);
  assert.equal(propertyFormSchema.safeParse({...parsed.data, offers:[parsed.data.offers[0],parsed.data.offers[0]]}).success,false);
  assert.equal(parsePropertyForm(form([])).success,true);
});
