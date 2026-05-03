import { DEFAULT_EXPENSE_CATEGORY } from "@/lib/expense-categories";

export function ExpenseCategorySelect({
  categories,
  defaultValue,
}: {
  categories: string[];
  defaultValue?: string;
}) {
  const options = categories.length > 0 ? categories : [DEFAULT_EXPENSE_CATEGORY];
  const fallbackValue = options.includes(DEFAULT_EXPENSE_CATEGORY)
    ? DEFAULT_EXPENSE_CATEGORY
    : options[0];

  return (
    <div className="field">
      <label className="field-label">Category</label>
      <select
        className="select"
        defaultValue={defaultValue ?? fallbackValue}
        name="category"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
