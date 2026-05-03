export function ExpenseCategorySelect({
  categories,
  defaultValue,
}: {
  categories: string[];
  defaultValue?: string;
}) {
  return (
    <div className="field">
      <label className="field-label">Category</label>
      <select
        className="select"
        defaultValue={defaultValue ?? ""}
        name="category"
      >
        <option value="">No category</option>
        {categories.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
