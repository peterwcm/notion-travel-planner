import type { TripDetail } from "@/lib/types";

export function convertToBaseCurrency(
  value: number | null | undefined,
  currency: string,
  detail: Pick<TripDetail, "currencyRates"> & {
    trip: {
      baseCurrency: string;
    };
  },
) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return { amount: null, missingCurrency: null };
  }

  if (currency === detail.trip.baseCurrency) {
    return { amount: value, missingCurrency: null };
  }

  const rate = detail.currencyRates.find(
    (entry) => entry.currency === currency,
  )?.rate;

  if (typeof rate !== "number" || Number.isNaN(rate) || rate <= 0) {
    return { amount: null, missingCurrency: currency };
  }

  return { amount: value * rate, missingCurrency: null };
}
