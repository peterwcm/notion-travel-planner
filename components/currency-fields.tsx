import type { TripCurrencyRate } from "@/lib/types";

export function getCurrencyOptions(
  baseCurrency: string,
  currencyRates: TripCurrencyRate[],
) {
  return Array.from(
    new Set([
      baseCurrency,
      ...currencyRates.map((entry) => entry.currency).filter(Boolean),
    ]),
  ).sort((a, b) => {
    if (a === baseCurrency) {
      return -1;
    }

    if (b === baseCurrency) {
      return 1;
    }

    return a.localeCompare(b);
  });
}

export function CostCurrencyFields({
  costDefaultValue,
  currencyDefaultValue,
  currencyOptions,
}: {
  costDefaultValue?: string | number;
  currencyDefaultValue: string;
  currencyOptions: string[];
}) {
  return (
    <>
      <div className="field">
        <label className="field-label">Cost</label>
        <input
          className="input"
          defaultValue={costDefaultValue}
          min={0}
          name="cost"
          placeholder="0"
          step="0.01"
          type="number"
        />
      </div>
      <CurrencySelect
        defaultValue={currencyDefaultValue}
        options={currencyOptions}
      />
    </>
  );
}

export function CurrencySelect({
  defaultValue,
  label = "Currency",
  name = "currency",
  options,
}: {
  defaultValue: string;
  label?: string;
  name?: string;
  options: string[];
}) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <select className="select" defaultValue={defaultValue} name={name}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
