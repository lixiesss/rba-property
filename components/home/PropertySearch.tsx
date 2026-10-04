
import { getI18n } from "@/lib/i18n/server";
import { PriceInputs } from "@/components/home/PriceInputs";

export async function PropertySearch({ catalogue = false, values = {}, locations = ["Uluwatu", "Ubud", "Pererenan", "Canggu"] }: { catalogue?: boolean; values?: Record<string, string>; locations?: string[] }) {
  const { t, href } = await getI18n();
  return (
    <section aria-label={t("Search properties")} className={catalogue ? "catalogue-search" : "home-search relative z-20"}>
      <div className={catalogue ? "" : "page-shell"}>
        <form action={href("/properties")} className="property-search">
          <h2 id="search-title" className="sr-only">{t("Search properties")}</h2>
          <SearchSelect label={t("Location")} name="location" value={values.location} options={[["", "All locations"], ...locations.map((location): [string, string] => [location.toLowerCase(), location])]} />
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
