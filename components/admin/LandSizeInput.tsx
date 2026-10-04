"use client";
import { useI18n } from "@/lib/i18n/client";


import { useState } from "react";

export function LandSizeInput({ initialM2 }: { initialM2?: number }) {
  const { t } = useI18n();
  const [unit, setUnit] = useState("m2");
  const [value, setValue] = useState(String(initialM2 ?? ""));
  const factor = (next: string) => ({ m2: 1, are: 100, ha: 10000 }[next] ?? 1);
  return <div className="admin-field">
    <span>{t("Land size")}</span>
    <div className="grid grid-cols-[1fr_110px] gap-2">
      <input name="land_size_value" type="number" aria-label={t("Land size value")} min="0.000001" step="any" value={value} required onChange={event => setValue(event.target.value)} />
      <select name="land_size_unit" aria-label={t("Land size unit")} value={unit} onChange={event => {
        const next = event.target.value;
        if (value) setValue(String(Number((Number(value) * factor(unit) / factor(next)).toFixed(8))));
        setUnit(next);
      }}><option value="m2">m²</option><option value="are">{t("Are")}</option><option value="ha">{t("Hectare")}</option></select>
    </div>
  </div>;
}
