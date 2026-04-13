"use server";

import { revalidatePath } from "next/cache";

import {
  archivePage,
  createDay,
  createFlight,
  createItem,
  createPickup,
  createReminder,
  createStay,
  createTrip,
  getNotionStatus,
  updateFlight,
  updateItem,
  updatePickup,
  updateReminder,
  updateStay,
  updateTrip,
} from "@/lib/notion";
import { daySchema, flightSchema, itemSchema, pickupSchema, reminderSchema, staySchema, tripSchema } from "@/lib/validators";

function assertConfigured() {
  const status = getNotionStatus();
  if (!status.configured) {
    throw new Error(`目前無法使用完整旅程資料，請先完成設定：${status.missing.join(", ")}`);
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

export async function updateTripAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const parsed = tripSchema.parse({
    title: formData.get("title"),
    destination: formData.get("destination"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    status: formData.get("status"),
    cover: formData.get("cover"),
    notes: formData.get("notes"),
  });

  await updateTrip(tripId, {
    ...parsed,
    cover: parsed.cover ?? "",
    notes: parsed.notes ?? "",
    startDate: parsed.startDate ?? "",
    endDate: parsed.endDate ?? "",
  });

  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
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

export async function createFlightAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const parsed = flightSchema.parse({
    tripId,
    title: formData.get("title"),
    airline: formData.get("airline"),
    flightNumber: formData.get("flightNumber"),
    departureAirport: formData.get("departureAirport"),
    arrivalAirport: formData.get("arrivalAirport"),
    departureAt: formData.get("departureAt"),
    arrivalAt: formData.get("arrivalAt"),
    terminal: formData.get("terminal"),
    gate: formData.get("gate"),
    notes: formData.get("notes"),
  });

  await createFlight({
    tripId: parsed.tripId,
    title: parsed.title,
    airline: parsed.airline ?? "",
    flightNumber: parsed.flightNumber ?? "",
    departureAirport: parsed.departureAirport ?? "",
    arrivalAirport: parsed.arrivalAirport ?? "",
    departureAt: parsed.departureAt ?? null,
    arrivalAt: parsed.arrivalAt ?? null,
    terminal: parsed.terminal ?? "",
    gate: parsed.gate ?? "",
    notes: parsed.notes ?? "",
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function updateFlightAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const flightId = String(formData.get("flightId") ?? "");
  const parsed = flightSchema.parse({
    tripId,
    title: formData.get("title"),
    airline: formData.get("airline"),
    flightNumber: formData.get("flightNumber"),
    departureAirport: formData.get("departureAirport"),
    arrivalAirport: formData.get("arrivalAirport"),
    departureAt: formData.get("departureAt"),
    arrivalAt: formData.get("arrivalAt"),
    terminal: formData.get("terminal"),
    gate: formData.get("gate"),
    notes: formData.get("notes"),
  });

  await updateFlight(flightId, {
    title: parsed.title,
    airline: parsed.airline ?? "",
    flightNumber: parsed.flightNumber ?? "",
    departureAirport: parsed.departureAirport ?? "",
    arrivalAirport: parsed.arrivalAirport ?? "",
    departureAt: parsed.departureAt ?? null,
    arrivalAt: parsed.arrivalAt ?? null,
    terminal: parsed.terminal ?? "",
    gate: parsed.gate ?? "",
    notes: parsed.notes ?? "",
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function createStayAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const parsed = staySchema.parse({
    tripId,
    title: formData.get("title"),
    checkInDate: formData.get("checkInDate"),
    checkOutDate: formData.get("checkOutDate"),
    address: formData.get("address"),
    bookingReference: formData.get("bookingReference"),
    notes: formData.get("notes"),
  });

  await createStay({
    tripId: parsed.tripId,
    title: parsed.title,
    checkInDate: parsed.checkInDate ?? null,
    checkOutDate: parsed.checkOutDate ?? null,
    address: parsed.address ?? "",
    bookingReference: parsed.bookingReference ?? "",
    notes: parsed.notes ?? "",
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function updateStayAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const stayId = String(formData.get("stayId") ?? "");
  const parsed = staySchema.parse({
    tripId,
    title: formData.get("title"),
    checkInDate: formData.get("checkInDate"),
    checkOutDate: formData.get("checkOutDate"),
    address: formData.get("address"),
    bookingReference: formData.get("bookingReference"),
    notes: formData.get("notes"),
  });

  await updateStay(stayId, {
    title: parsed.title,
    checkInDate: parsed.checkInDate ?? null,
    checkOutDate: parsed.checkOutDate ?? null,
    address: parsed.address ?? "",
    bookingReference: parsed.bookingReference ?? "",
    notes: parsed.notes ?? "",
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function createPickupAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const parsed = pickupSchema.parse({
    tripId,
    title: formData.get("title"),
    pickupAt: formData.get("pickupAt"),
    pickupLocation: formData.get("pickupLocation"),
    dropoffLocation: formData.get("dropoffLocation"),
    provider: formData.get("provider"),
    contact: formData.get("contact"),
    notes: formData.get("notes"),
  });

  await createPickup({
    tripId: parsed.tripId,
    title: parsed.title,
    pickupAt: parsed.pickupAt ?? null,
    pickupLocation: parsed.pickupLocation ?? "",
    dropoffLocation: parsed.dropoffLocation ?? "",
    provider: parsed.provider ?? "",
    contact: parsed.contact ?? "",
    notes: parsed.notes ?? "",
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function updatePickupAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const pickupId = String(formData.get("pickupId") ?? "");
  const parsed = pickupSchema.parse({
    tripId,
    title: formData.get("title"),
    pickupAt: formData.get("pickupAt"),
    pickupLocation: formData.get("pickupLocation"),
    dropoffLocation: formData.get("dropoffLocation"),
    provider: formData.get("provider"),
    contact: formData.get("contact"),
    notes: formData.get("notes"),
  });

  await updatePickup(pickupId, {
    title: parsed.title,
    pickupAt: parsed.pickupAt ?? null,
    pickupLocation: parsed.pickupLocation ?? "",
    dropoffLocation: parsed.dropoffLocation ?? "",
    provider: parsed.provider ?? "",
    contact: parsed.contact ?? "",
    notes: parsed.notes ?? "",
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function createReminderAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const parsed = reminderSchema.parse({
    tripId,
    title: formData.get("title"),
    remindAt: formData.get("remindAt"),
    location: formData.get("location"),
    url: formData.get("url"),
    notes: formData.get("notes"),
  });

  await createReminder({
    tripId: parsed.tripId,
    title: parsed.title,
    remindAt: parsed.remindAt ?? null,
    location: parsed.location ?? "",
    url: parsed.url ?? "",
    notes: parsed.notes ?? "",
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function updateReminderAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const reminderId = String(formData.get("reminderId") ?? "");
  const parsed = reminderSchema.parse({
    tripId,
    title: formData.get("title"),
    remindAt: formData.get("remindAt"),
    location: formData.get("location"),
    url: formData.get("url"),
    notes: formData.get("notes"),
  });

  await updateReminder(reminderId, {
    title: parsed.title,
    remindAt: parsed.remindAt ?? null,
    location: parsed.location ?? "",
    url: parsed.url ?? "",
    notes: parsed.notes ?? "",
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function deleteEntityAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const entityId = String(formData.get("entityId") ?? "");

  await archivePage(entityId);
  revalidatePath(`/trips/${tripId}`);
}
