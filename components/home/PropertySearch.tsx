
import { getI18n } from "@/lib/i18n/server";
import { PriceInputs } from "@/components/home/PriceInputs";
import { marketAreas } from "@/lib/market-areas";
import { getPublishedProperties } from "@/lib/data/properties";

export async function PropertySearch({ catalogue = false, values = {}, areas }: { catalogue?: boolean; values?: Record<string, string>; areas?: string[] }) {
  const { t, href, locale } = await getI18n();
  const available = areas ?? (await getPublishedProperties({}, locale)).flatMap(property => property.marketArea ? [property.marketArea] : []);
  return (
    <section aria-label={t("Search properties")} className={catalogue ? "catalogue-search" : "home-search relative z-20"}>
      <div className={catalogue ? "" : "page-shell"}>
        <form action={href("/properties")} className="property-search">
          <h2 id="search-title" className="sr-only">{t("Search properties")}</h2>
          <SearchSelect label={t("Area")} name="area" value={values.area} options={[["", "All areas"], ...marketAreas.filter(([key]) => available.includes(key) || values.area === key).map(([key,label]): [string,string] => [key,label])]} />
          <SearchSelect label={t("Property type")} name="type" value={values.type} options={[["", "All types"], ["villa", "Villa"], ["land", "Land"], ["investment", "Investment property"]]} />
          <SearchSelect label={t("Offer")} name="listing" value={values.listing} options={[["", "Sale & lease"], ["sale", "Sale"], ["lease", "Lease"]]} />
          <SearchSelect label={t("Price basis")} name="priceBasis" value={values.priceBasis || "global"} options={[["global", "Total price"], ["per_are", "Per are"], ["per_are_per_year", "Per are / year"]]} />
          <PriceInputs key={`${values.minPrice}-${values.maxPrice}`} min={values.minPrice} max={values.maxPrice} />
          <button type="submit" className="button-primary">{t("Search")} <span aria-hidden="true">&#8594;</span></button>
        </form>
      </div>
    </section>
  );
}

async function SearchSelect({ label, name, value = "", options }: { label: string; name: string; value?: string; options: [string, string][] }) {
  const { t } = await getI18n();
  return (
    <label className="search-field search-select">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <select name={name} defaultValue={value} key={value} autoComplete="off">
        {options.map(([value, text]) => <option value={value} key={value}>{t(text)}</option>)}
      </select>
    </label>
  );
}
