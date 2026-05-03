"use server";

import { revalidatePath } from "next/cache";

import {
  addExpenseCategory,
  deleteExpenseCategory,
  getNotionStatus,
  reorderExpenseCategories,
  updateExpenseCategory,
} from "@/lib/notion";

function assertConfigured() {
  const status = getNotionStatus();
  if (!status.configured) {
    throw new Error(
      `Travel data is unavailable until setup is complete: ${status.missing.join(", ")}`,
    );
  }
}

export async function createExpenseCategoryAction(formData: FormData) {
  assertConfigured();

  const category = String(formData.get("category") ?? "").trim();
  if (!category) {
    throw new Error("Enter a category name.");
  }

  await addExpenseCategory(category);

  revalidatePath("/settings");
  revalidatePath("/trips");
}

export async function updateExpenseCategoryAction(formData: FormData) {
  assertConfigured();

  const categoryId = String(formData.get("categoryId") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  if (!categoryId || !category) {
    throw new Error("Enter a category name.");
  }

  await updateExpenseCategory(categoryId, category);

  revalidatePath("/settings");
  revalidatePath("/trips");
}

export async function deleteExpenseCategoryAction(formData: FormData) {
  assertConfigured();

  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) {
    throw new Error("Missing category id.");
  }

  await deleteExpenseCategory(categoryId);

  revalidatePath("/settings");
  revalidatePath("/trips");
}

export async function reorderExpenseCategoriesAction(formData: FormData) {
  assertConfigured();

  const orderedCategoryIds = JSON.parse(
    String(formData.get("orderedCategoryIds") ?? "[]"),
  ) as string[];

  await reorderExpenseCategories(orderedCategoryIds);

  revalidatePath("/settings");
  revalidatePath("/trips");
}
