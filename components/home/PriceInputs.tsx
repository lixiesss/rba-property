"use client";
import { useI18n } from "@/lib/i18n/client";


import { useEffect, useRef, useState } from "react";

export function PriceInputs({ min = "", max = "" }: { min?: string; max?: string }) {
  const { t } = useI18n();
  const [minimum, setMinimum] = useState(min);
  const [maximum, setMaximum] = useState(max);
  const maxInput = useRef<HTMLInputElement>(null);
  const invalid = Boolean(minimum && maximum && Number(minimum) > Number(maximum));
  useEffect(() => {
    maxInput.current?.setCustomValidity(invalid ? t("Max price must be at least Min price.") : "");
  }, [invalid, t]);

  function update(value: string, isMin: boolean) {
    const digits = value.replace(/^(?:IDR|Rp\.?)\s*/i, "").replace(/[,\s]/g, "");
    if (!/^\d{0,15}$/.test(digits)) return;
    const nextMin = isMin ? digits : minimum;
    const nextMax = isMin ? maximum : digits;
    if (isMin) setMinimum(digits); else setMaximum(digits);
    maxInput.current?.setCustomValidity(nextMin && nextMax && Number(nextMin) > Number(nextMax) ? t("Max price must be at least Min price.") : "");
  }

  function display(value: string) {
    return value ? new Intl.NumberFormat("en-US").format(Number(value)) : "";
  }

  return <div className="search-prices">
    <label className="search-field"><span>{t("Min price (IDR)")}</span><input inputMode="numeric" autoComplete="off" aria-label={t("Min price in IDR")} placeholder={t("No minimum")} value={display(minimum)} onChange={(event) => update(event.target.value, true)} /></label>
    <label className="search-field"><span>{t("Max price (IDR)")}</span><input ref={maxInput} inputMode="numeric" autoComplete="off" aria-label={t("Max price in IDR")} placeholder={t("No maximum")} value={display(maximum)} onChange={(event) => update(event.target.value, false)} aria-invalid={invalid} aria-describedby={invalid ? "price-error" : undefined} /></label>
    <input type="hidden" name="minPrice" value={minimum} /><input type="hidden" name="maxPrice" value={maximum} />
    {invalid ? <p id="price-error" className="search-price-error" role="alert">{t("Max price must be at least Min price.")}</p> : null}
  </div>;
}
