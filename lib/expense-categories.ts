export const DEFAULT_EXPENSE_CATEGORIES = [
  "Accommodation",
  "Food",
  "Transport",
  "Sightseeing",
  "Shopping",
  "Miscellaneous",
] as const;

export const DEFAULT_EXPENSE_CATEGORY =
  DEFAULT_EXPENSE_CATEGORIES[DEFAULT_EXPENSE_CATEGORIES.length - 1];

export function normalizeExpenseCategory(
  value?: string | null,
  fallback: string = DEFAULT_EXPENSE_CATEGORY,
) {
  const trimmed = value?.trim() ?? "";
  return trimmed || fallback;
}

export function uniqueExpenseCategories(categories: string[]) {
  return Array.from(
    new Set(categories.map((category) => category.trim()).filter(Boolean)),
  );
}
