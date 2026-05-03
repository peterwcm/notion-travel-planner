"use client";

import { useEffect, useMemo, useState } from "react";

import { currency } from "@/lib/utils";

type SummaryCategory = "itinerary" | "flights" | "stays" | "expenses";

interface SummarySection {
  id: Exclude<SummaryCategory, "expenses">;
  cost: number;
  taxRefund: number;
  missingRateCurrencies: string[];
}

interface ExpenseCategorySummary {
  category: string;
  cost: number;
  taxRefund: number;
  missingRateCurrencies: string[];
}

interface TripCostSummaryProps {
  baseCurrency: string;
  sections: SummarySection[];
  expenseCategories: ExpenseCategorySummary[];
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
  expenseCategories,
}: TripCostSummaryProps) {
  const [selectedCategories, setSelectedCategories] = useState<
    Record<SummaryCategory, boolean>
  >(() =>
    Object.fromEntries(
      CATEGORY_ORDER.map((category) => [category, true]),
    ) as Record<SummaryCategory, boolean>,
  );
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setSelectedExpenseCategories((current) => {
      const next = Object.fromEntries(
        expenseCategories.map((entry) => [
          entry.category,
          current[entry.category] ?? true,
        ]),
      ) as Record<string, boolean>;

      return next;
    });
  }, [expenseCategories]);

  const summary = useMemo(() => {
    const selectedSections = sections.filter(
      (section) => selectedCategories[section.id],
    );
    const selectedExpenseEntries = selectedCategories.expenses
      ? expenseCategories.filter(
          (entry) => selectedExpenseCategories[entry.category] ?? true,
        )
      : [];

    const totalCost =
      selectedSections.reduce((total, section) => total + section.cost, 0) +
      selectedExpenseEntries.reduce((total, entry) => total + entry.cost, 0);
    const totalTaxRefund =
      selectedSections.reduce((total, section) => total + section.taxRefund, 0) +
      selectedExpenseEntries.reduce(
        (total, entry) => total + entry.taxRefund,
        0,
      );
    const missingRateCurrencies = Array.from(
      new Set([
        ...selectedSections.flatMap((section) => section.missingRateCurrencies),
        ...selectedExpenseEntries.flatMap(
          (entry) => entry.missingRateCurrencies,
        ),
      ]),
    ).sort();

    return {
      totalCost,
      totalTaxRefund,
      missingRateCurrencies,
    };
  }, [expenseCategories, sections, selectedCategories, selectedExpenseCategories]);

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
        {selectedCategories.expenses && expenseCategories.length > 0 ? (
          <div className="summary-filters__nested">
            <div className="summary-filters__grid">
              {expenseCategories.map((entry) => (
                <label className="summary-filter" key={entry.category}>
                  <input
                    checked={selectedExpenseCategories[entry.category] ?? true}
                    onChange={(event) =>
                      setSelectedExpenseCategories((current) => ({
                        ...current,
                        [entry.category]: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>{entry.category}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
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
