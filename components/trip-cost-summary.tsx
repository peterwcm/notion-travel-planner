"use client";

import { useMemo, useState } from "react";

import { currency } from "@/lib/utils";

type SummaryCategory = "itinerary" | "flights" | "stays" | "expenses";

interface SummarySection {
  id: SummaryCategory;
  label: string;
  cost: number;
  taxRefund: number;
  missingRateCurrencies: string[];
}

interface TripCostSummaryProps {
  baseCurrency: string;
  sections: SummarySection[];
}

const CATEGORY_ORDER: SummaryCategory[] = [
  "itinerary",
  "flights",
  "stays",
  "expenses",
];

const CATEGORY_LABELS: Record<SummaryCategory, string> = {
  itinerary: "Itinerary",
  flights: "Flights",
  stays: "Stays",
  expenses: "Expenses",
};

export function TripCostSummary({
  baseCurrency,
  sections,
}: TripCostSummaryProps) {
  const [selectedCategories, setSelectedCategories] = useState<
    Record<SummaryCategory, boolean>
  >(() =>
    Object.fromEntries(
      CATEGORY_ORDER.map((category) => [category, true]),
    ) as Record<SummaryCategory, boolean>,
  );

  const summary = useMemo(() => {
    const selectedSections = sections.filter(
      (section) => selectedCategories[section.id],
    );

    const totalCost = selectedSections.reduce(
      (total, section) => total + section.cost,
      0,
    );
    const totalTaxRefund = selectedSections.reduce(
      (total, section) => total + section.taxRefund,
      0,
    );
    const missingRateCurrencies = Array.from(
      new Set(
        selectedSections.flatMap((section) => section.missingRateCurrencies),
      ),
    ).sort();

    return {
      totalCost,
      totalTaxRefund,
      missingRateCurrencies,
    };
  }, [sections, selectedCategories]);

  return (
    <>
      <div className="metrics metrics--summary">
        <div className="metric">
          <span className="metric__label">Total cost</span>
          <strong>{currency(summary.totalCost, baseCurrency)}</strong>
        </div>
        <div className="metric">
          <span className="metric__label">Total tax refund</span>
          <strong>{currency(summary.totalTaxRefund, baseCurrency)}</strong>
        </div>
        <div className="metric">
          <span className="metric__label">Net cost</span>
          <strong>
            {currency(summary.totalCost - summary.totalTaxRefund, baseCurrency)}
          </strong>
        </div>
      </div>
      <fieldset className="summary-filters">
        <legend className="summary-filters__label">Include in totals</legend>
        <div className="summary-filters__grid">
          {CATEGORY_ORDER.map((category) => (
            <label className="summary-filter" key={category}>
              <input
                checked={selectedCategories[category]}
                onChange={(event) =>
                  setSelectedCategories((current) => ({
                    ...current,
                    [category]: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span>{CATEGORY_LABELS[category]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {summary.missingRateCurrencies.length > 0 ? (
        <p className="muted">
          Missing exchange rate for {summary.missingRateCurrencies.join(", ")}.
          Those values are not included in totals.
        </p>
      ) : null}
    </>
  );
}
