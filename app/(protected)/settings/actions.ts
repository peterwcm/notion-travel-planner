"use server";

import { revalidatePath } from "next/cache";

import { addExpenseCategory, getNotionStatus } from "@/lib/notion";

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
