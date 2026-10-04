"use client";
import { useI18n } from "@/lib/i18n/client";


import { useState } from "react";
import { mapOffers } from "@/lib/offers";

export function OfferEditor({ initialOffers = [] }: { initialOffers?: Array<Record<string, unknown>> }) {
  const { t } = useI18n();
  const initial = mapOffers(initialOffers);
  const [enabled, setEnabled] = useState({ sale: initial.some(o => o.offerType === "sale"), lease: initial.some(o => o.offerType === "lease") });
  return <div className="admin-field-full space-y-4">
    <div className="flex flex-wrap gap-3">{(["sale", "lease"] as const).map(type => <label key={type} className="admin-checkbox">
      <input type="checkbox" name={`${type}_enabled`} checked={enabled[type]} onChange={event => setEnabled(values => ({ ...values, [type]: event.target.checked }))} />
      {type === "sale" ? t("Sale offer") : t("Lease offer")}
    </label>)}</div>
    {(["sale", "lease"] as const).map(type => {
      const offer = initial.find(o => o.offerType === type);
      return <fieldset key={type} disabled={!enabled[type]} hidden={!enabled[type]} className="border-t border-line pt-4">
        <legend className="px-1 text-sm font-semibold capitalize">{t(type)}</legend>
        <div className="admin-form-grid">
          <label className="admin-field"><span>{t("Price")}</span><input name={`${type}_price`} type="number" min="0" step="0.01" defaultValue={offer?.price ?? ""} required /></label>
          <label className="admin-field"><span>{t("Currency")}</span><input name={`${type}_currency`} defaultValue={offer?.currency ?? "IDR"} pattern="[A-Za-z]{3}" maxLength={3} required /></label>
          <label className="admin-field"><span>{t("Price basis")}</span><select name={`${type}_basis`} defaultValue={offer?.priceBasis ?? "global"}><option value="global">{t("Global")}</option><option value="per_are">{t("Per Are")}</option>{type === "lease" ? <option value="per_are_per_year">{t("Per Are Per Year")}</option> : null}</select></label>
          <label className="admin-checkbox"><input name={`${type}_negotiable`} type="checkbox" defaultChecked={offer?.negotiable ?? false} />{t("Negotiable")}</label>
        </div>
      </fieldset>;
    })}
  </div>;
}
