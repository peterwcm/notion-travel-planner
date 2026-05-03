import { FormDialog } from "@/components/form-dialog";
import { SubmitButton } from "@/components/submit-button";
import { ExpenseCategoryList } from "@/components/expense-category-list";
import {
  createExpenseCategoryAction,
} from "@/app/(protected)/settings/actions";
import {
  getExpenseCategoryEntries,
  getNotionStatus,
} from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const setupStatus = getNotionStatus();
  let categories: Array<{ id: string; name: string }> = [];
  let hasLoadError = false;

  try {
    categories = await getExpenseCategoryEntries();
  } catch {
    hasLoadError = true;
  }

  if (!setupStatus.configured || hasLoadError) {
    return (
      <div className="page">
        <div className="notice">
          <strong>Settings are temporarily unavailable</strong>
          <p className="muted">Check the setup and refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--tight">
      <section className="section-block">
        <div className="header-actions">
          <h2 className="section-title">Settings</h2>
        </div>
        <section className="settings-section">
          <div className="header-actions">
            <h3 className="section-title">Expense categories</h3>
            <FormDialog
              description="Add an expense category."
              title="New category"
              resetKey={`new-category-${categories.length}`}
              triggerLabel="New category"
            >
              <form action={createExpenseCategoryAction} className="stack">
                <div className="field">
                  <label className="field-label field-label--required">
                    Name
                  </label>
                  <input
                    className="input"
                    name="category"
                    placeholder="Parking"
                    required
                  />
                </div>
                <SubmitButton>Create category</SubmitButton>
              </form>
            </FormDialog>
          </div>
          <ExpenseCategoryList categories={categories} />
        </section>
      </section>
    </div>
  );
}
