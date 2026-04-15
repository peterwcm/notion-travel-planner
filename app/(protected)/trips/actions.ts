"use server";

import { revalidatePath } from "next/cache";

import { normalizeFlightPassengers } from "@/lib/flight-passengers";
import {
  archivePage,
  createDay,
  createFlight,
  createItem,
  createStay,
  createTrip,
  getNotionStatus,
  updateFlight,
  updateItem,
  updateStay,
  updateTrip,
} from "@/lib/notion";
import { daySchema, flightSchema, itemSchema, staySchema, tripSchema } from "@/lib/validators";

function assertConfigured() {
  const status = getNotionStatus();
  if (!status.configured) {
    throw new Error(`Travel data is unavailable until setup is complete: ${status.missing.join(", ")}`);
  }
}

export async function createTripAction(formData: FormData) {
  assertConfigured();
  const startDateTimeZone = String(formData.get("startDateTimeZone") ?? "");
  const endDateTimeZone = String(formData.get("endDateTimeZone") ?? "");

  const parsed = tripSchema.parse({
    title: formData.get("title"),
    destination: formData.get("destination"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    cover: formData.get("cover"),
    notes: formData.get("notes"),
  });

  await createTrip({
    ...parsed,
    cover: parsed.cover ?? "",
    notes: parsed.notes ?? "",
    startDate: parsed.startDate ?? "",
    endDate: parsed.endDate ?? "",
  }, {
    startDate: startDateTimeZone || null,
    endDate: endDateTimeZone || null,
  });

  revalidatePath("/trips");
}

export async function updateTripAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const startDateTimeZone = String(formData.get("startDateTimeZone") ?? "");
  const endDateTimeZone = String(formData.get("endDateTimeZone") ?? "");
  const parsed = tripSchema.parse({
    title: formData.get("title"),
    destination: formData.get("destination"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    cover: formData.get("cover"),
    notes: formData.get("notes"),
  });

  await updateTrip(tripId, {
    ...parsed,
    cover: parsed.cover ?? "",
    notes: parsed.notes ?? "",
    startDate: parsed.startDate ?? "",
    endDate: parsed.endDate ?? "",
  }, {
    startDate: startDateTimeZone || null,
    endDate: endDateTimeZone || null,
  });

  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
}

export async function createDayAction(formData: FormData) {
  assertConfigured();
  const dateTimeZone = String(formData.get("dateTimeZone") ?? "");

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
  }, dateTimeZone || null);

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
  const departureAtTimeZone = String(formData.get("departureAtTimeZone") ?? "");
  const arrivalAtTimeZone = String(formData.get("arrivalAtTimeZone") ?? "");
  const parsed = flightSchema.parse({
    tripId,
    airline: formData.get("airline"),
    flightNumber: formData.get("flightNumber"),
    departureAirport: formData.get("departureAirport"),
    arrivalAirport: formData.get("arrivalAirport"),
    departureAt: formData.get("departureAt"),
    arrivalAt: formData.get("arrivalAt"),
    aircraft: formData.get("aircraft"),
    baggageInfo: formData.get("baggageInfo"),
    cost: formData.get("cost"),
    passengers: formData.get("passengers"),
    notes: formData.get("notes"),
  });

  await createFlight({
    tripId: parsed.tripId,
    airline: parsed.airline,
    flightNumber: parsed.flightNumber,
    departureAirport: parsed.departureAirport,
    arrivalAirport: parsed.arrivalAirport,
    departureAt: parsed.departureAt,
    arrivalAt: parsed.arrivalAt,
    aircraft: parsed.aircraft ?? "",
    baggageInfo: parsed.baggageInfo ?? "",
    cost: parsed.cost,
    passengers: normalizeFlightPassengers(parsed.passengers),
    notes: parsed.notes ?? "",
  }, {
    departureAt: departureAtTimeZone || null,
    arrivalAt: arrivalAtTimeZone || null,
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function updateFlightAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const flightId = String(formData.get("flightId") ?? "");
  const departureAtTimeZone = String(formData.get("departureAtTimeZone") ?? "");
  const arrivalAtTimeZone = String(formData.get("arrivalAtTimeZone") ?? "");
  const parsed = flightSchema.parse({
    tripId,
    airline: formData.get("airline"),
    flightNumber: formData.get("flightNumber"),
    departureAirport: formData.get("departureAirport"),
    arrivalAirport: formData.get("arrivalAirport"),
    departureAt: formData.get("departureAt"),
    arrivalAt: formData.get("arrivalAt"),
    aircraft: formData.get("aircraft"),
    baggageInfo: formData.get("baggageInfo"),
    cost: formData.get("cost"),
    passengers: formData.get("passengers"),
    notes: formData.get("notes"),
  });

  await updateFlight(flightId, {
    airline: parsed.airline,
    flightNumber: parsed.flightNumber,
    departureAirport: parsed.departureAirport,
    arrivalAirport: parsed.arrivalAirport,
    departureAt: parsed.departureAt,
    arrivalAt: parsed.arrivalAt,
    aircraft: parsed.aircraft ?? "",
    baggageInfo: parsed.baggageInfo ?? "",
    cost: parsed.cost,
    passengers: normalizeFlightPassengers(parsed.passengers),
    notes: parsed.notes ?? "",
  }, {
    departureAt: departureAtTimeZone || null,
    arrivalAt: arrivalAtTimeZone || null,
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function createStayAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const checkInDateTimeZone = String(formData.get("checkInDateTimeZone") ?? "");
  const checkOutDateTimeZone = String(formData.get("checkOutDateTimeZone") ?? "");
  const parsed = staySchema.parse({
    tripId,
    title: formData.get("title"),
    checkInDate: formData.get("checkInDate"),
    checkOutDate: formData.get("checkOutDate"),
    checkInTime: formData.get("checkInTime"),
    checkOutTime: formData.get("checkOutTime"),
    cost: formData.get("cost"),
    address: formData.get("address"),
    url: formData.get("url"),
    bookingReference: formData.get("bookingReference"),
    notes: formData.get("notes"),
  });

  await createStay({
    tripId: parsed.tripId,
    title: parsed.title,
    checkInDate: parsed.checkInDate ?? null,
    checkOutDate: parsed.checkOutDate ?? null,
    checkInTime: parsed.checkInTime ?? "",
    checkOutTime: parsed.checkOutTime ?? "",
    cost: parsed.cost,
    address: parsed.address ?? "",
    url: parsed.url ?? "",
    bookingReference: parsed.bookingReference ?? "",
    notes: parsed.notes ?? "",
  }, {
    checkInDate: checkInDateTimeZone || null,
    checkOutDate: checkOutDateTimeZone || null,
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function updateStayAction(formData: FormData) {
  assertConfigured();

  const tripId = String(formData.get("tripId") ?? "");
  const stayId = String(formData.get("stayId") ?? "");
  const checkInDateTimeZone = String(formData.get("checkInDateTimeZone") ?? "");
  const checkOutDateTimeZone = String(formData.get("checkOutDateTimeZone") ?? "");
  const parsed = staySchema.parse({
    tripId,
    title: formData.get("title"),
    checkInDate: formData.get("checkInDate"),
    checkOutDate: formData.get("checkOutDate"),
    checkInTime: formData.get("checkInTime"),
    checkOutTime: formData.get("checkOutTime"),
    cost: formData.get("cost"),
    address: formData.get("address"),
    url: formData.get("url"),
    bookingReference: formData.get("bookingReference"),
    notes: formData.get("notes"),
  });

  await updateStay(stayId, {
    title: parsed.title,
    checkInDate: parsed.checkInDate ?? null,
    checkOutDate: parsed.checkOutDate ?? null,
    checkInTime: parsed.checkInTime ?? "",
    checkOutTime: parsed.checkOutTime ?? "",
    cost: parsed.cost,
    address: parsed.address ?? "",
    url: parsed.url ?? "",
    bookingReference: parsed.bookingReference ?? "",
    notes: parsed.notes ?? "",
  }, {
    checkInDate: checkInDateTimeZone || null,
    checkOutDate: checkOutDateTimeZone || null,
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
