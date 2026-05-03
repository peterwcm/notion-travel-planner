"use client";

import { useEffect, useRef, useState } from "react";

import { ConfirmDeleteForm } from "@/components/confirm-delete-form";
import { EditIcon, GripIcon, TrashIcon } from "@/components/icons";
import { FormDialog } from "@/components/form-dialog";
import { SubmitButton } from "@/components/submit-button";
import {
  deleteExpenseCategoryAction,
  reorderExpenseCategoriesAction,
  updateExpenseCategoryAction,
} from "@/app/(protected)/settings/actions";
import type { ExpenseCategoryEntry } from "@/lib/types";

interface ExpenseCategoryListProps {
  categories: ExpenseCategoryEntry[];
}

export function ExpenseCategoryList({ categories }: ExpenseCategoryListProps) {
  const [orderedCategories, setOrderedCategories] = useState(categories);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(
    null,
  );
  const orderFormRef = useRef<HTMLFormElement>(null);
  const orderedCategoryIdsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrderedCategories(categories);
  }, [categories]);

  function persistOrder(nextCategories: ExpenseCategoryEntry[]) {
    const nextCategoryIds = nextCategories.map((category) => category.id);
    setOrderedCategories(nextCategories);

    if (!orderFormRef.current || !orderedCategoryIdsRef.current) {
      return;
    }

    orderedCategoryIdsRef.current.value = JSON.stringify(nextCategoryIds);
    orderFormRef.current.requestSubmit();
  }

  function handleDrop(targetCategoryId: string) {
    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null);
      return;
    }

    const fromIndex = orderedCategories.findIndex(
      (category) => category.id === draggedCategoryId,
    );
    const toIndex = orderedCategories.findIndex(
      (category) => category.id === targetCategoryId,
    );

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedCategoryId(null);
      return;
    }

    const next = [...orderedCategories];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    persistOrder(next);
    setDraggedCategoryId(null);
  }

  return (
    <>
      <form
        action={reorderExpenseCategoriesAction}
        aria-hidden="true"
        ref={orderFormRef}
        style={{ display: "none" }}
      >
        <input
          name="orderedCategoryIds"
          ref={orderedCategoryIdsRef}
          type="hidden"
        />
      </form>

      {orderedCategories.length > 0 ? (
        <section className="settings-category-grid">
          {orderedCategories.map((category) => (
            <article
              className={
                draggedCategoryId === category.id
                  ? "detail-card settings-category-card settings-category-card--dragging"
                  : "detail-card settings-category-card"
              }
              key={category.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(category.id)}
            >
              <div className="settings-category-card__top">
                <button
                  aria-label={`Drag ${category.name} to reorder`}
                  className="icon-button category-drag-handle"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", category.id);
                    setDraggedCategoryId(category.id);
                  }}
                  onDragEnd={() => setDraggedCategoryId(null)}
                  type="button"
                >
                  <GripIcon />
                </button>
                <h4 className="settings-category-card__title">
                  {category.name}
                </h4>
                <div className="card-corner-actions settings-category-card__actions">
                  <FormDialog
                    description="Rename this expense category."
                    title={`Edit ${category.name}`}
                    resetKey={`edit-category-${category.id}-${category.name}`}
                    triggerAriaLabel="Edit category"
                    triggerClassName="icon-button"
                    triggerContent={<EditIcon />}
                    triggerLabel="Edit"
                  >
                    <form
                      action={updateExpenseCategoryAction}
                      className="stack"
                    >
                      <input
                        name="categoryId"
                        type="hidden"
                        value={category.id}
                      />
                      <div className="field">
                        <label className="field-label field-label--required">
                          Name
                        </label>
                        <input
                          className="input"
                          defaultValue={category.name}
                          name="category"
                          required
                        />
                      </div>
                      <SubmitButton>Save category</SubmitButton>
                    </form>
                  </FormDialog>
                  <ConfirmDeleteForm
                    action={deleteExpenseCategoryAction}
                    confirmMessage={`Delete ${category.name}? Existing expenses will become uncategorized.`}
                  >
                    <input
                      name="categoryId"
                      type="hidden"
                      value={category.id}
                    />
                    <button
                      aria-label="Delete category"
                      className="icon-button icon-button--danger"
                      type="submit"
                    >
                      <TrashIcon />
                    </button>
                  </ConfirmDeleteForm>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="empty">No categories yet.</div>
      )}

    </>
  );
}
