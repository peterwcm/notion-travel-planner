"use server";

import { revalidatePath } from "next/cache";

import { archivePage, createDay, createItem, createTrip, getNotionStatus, updateItem } from "@/lib/notion";
import { daySchema, itemSchema, tripSchema } from "@/lib/validators";

function assertConfigured() {
  const status = getNotionStatus();
  if (!status.configured) {
    throw new Error(`Notion 尚未完成設定：${status.missing.join(", ")}`);
  }
}

export async function createTripAction(formData: FormData) {
  assertConfigured();

  const parsed = tripSchema.parse({
    title: formData.get("title"),
    destination: formData.get("destination"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    status: formData.get("status"),
    cover: formData.get("cover"),
    notes: formData.get("notes"),
  });

  await createTrip({
    ...parsed,
    cover: parsed.cover ?? "",
    notes: parsed.notes ?? "",
    startDate: parsed.startDate ?? "",
    endDate: parsed.endDate ?? "",
  });

  revalidatePath("/trips");
}

export async function createDayAction(formData: FormData) {
  assertConfigured();

  const parsed = daySchema.parse({
    tripId: formData.get("tripId"),
    title: formData.get("title"),
    date: formData.get("date"),
    dayNumber: formData.get("dayNumber"),
    summary: formData.get("summary"),
  });

  await createDay({
    ...parsed,
    date: parsed.date ?? "",
    summary: parsed.summary ?? "",
  });

  revalidatePath(`/trips/${parsed.tripId}`);
}

export async function createItemAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const parsed = itemSchema.parse({
    dayId: formData.get("dayId"),
    title: formData.get("title"),
    type: formData.get("type"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    location: formData.get("location"),
    cost: formData.get("cost"),
    url: formData.get("url"),
    notes: formData.get("notes"),
    order: formData.get("order"),
  });

  await createItem({
    ...parsed,
    startTime: parsed.startTime ?? "",
    endTime: parsed.endTime ?? "",
    location: parsed.location ?? "",
    url: parsed.url ?? "",
    notes: parsed.notes ?? "",
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function updateItemAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");
  const parsed = itemSchema.parse({
    dayId: formData.get("dayId"),
    title: formData.get("title"),
    type: formData.get("type"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    location: formData.get("location"),
    cost: formData.get("cost"),
    url: formData.get("url"),
    notes: formData.get("notes"),
    order: formData.get("order"),
  });

  await updateItem(itemId, {
    title: parsed.title,
    type: parsed.type,
    startTime: parsed.startTime ?? "",
    endTime: parsed.endTime ?? "",
    location: parsed.location ?? "",
    cost: parsed.cost,
    url: parsed.url ?? "",
    notes: parsed.notes ?? "",
    order: parsed.order,
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function deleteItemAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");

  await archivePage(itemId);
  revalidatePath(`/trips/${tripId}`);
}

