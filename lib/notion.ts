import { Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

import { getRequiredEnv, getSetupStatus } from "@/lib/env";
import { getFlightDisplayLabel, parseFlightPassengers, serializeFlightPassengers } from "@/lib/flight-passengers";
import type {
  ItemType,
  SetupStatus,
  Trip,
  TripDay,
  TripDetail,
  TripExpense,
  TripFlight,
  TripItem,
  TripStay,
} from "@/lib/types";
import { sum } from "@/lib/utils";

const TRIP_PROPS = {
  destination: "Destination",
  startDate: "Start Date",
  endDate: "End Date",
  notes: "Notes",
} as const;

const DAY_PROPS = {
  title: "Name",
  trip: "Trip",
  date: "Date",
  dayNumber: "Day Number",
  summary: "Summary",
} as const;

const ITEM_PROPS = {
  title: "Name",
  day: "Day",
  startTime: "Start Time",
  endTime: "End Time",
  type: "Item Type",
  location: "Location",
  cost: "Cost",
  url: "Link",
  notes: "Notes",
  order: "Order",
} as const;

const FLIGHT_PROPS = {
  title: "Name",
  trip: "Trip",
  airline: "Airline",
  flightNumber: "Flight Number",
  departureAirport: "Departure Airport",
  arrivalAirport: "Arrival Airport",
  departureAt: "Departure Time",
  arrivalAt: "Arrival Time",
  aircraft: "Aircraft",
  baggageInfo: "Baggage Info",
  cost: "Cost",
  passengers: "Passengers",
  notes: "Notes",
} as const;

const STAY_PROPS = {
  title: "Name",
  trip: "Trip",
  checkInDate: "Check-in Date",
  checkOutDate: "Check-out Date",
  cost: "Cost",
  address: "Address",
  url: "Link",
  bookingReference: "Booking Reference",
  notes: "Notes",
} as const;

const EXPENSE_PROPS = {
  title: "Name",
  trip: "Trip",
  date: "Date",
  cost: "Cost",
  taxRefund: "Tax Refund",
} as const;

function getClient() {
  return new Client({ auth: getRequiredEnv("NOTION_TOKEN") });
}

function richText(content: string) {
  return [{ type: "text" as const, text: { content } }];
}

function richTextProperty(content?: string) {
  return { rich_text: content ? richText(content) : [] };
}

function titleProperty(content: string) {
  return { title: richText(content) };
}

function dateProperty(value?: string | null) {
  if (!value) {
    return { date: null };
  }

  if (value.includes("T")) {
    return {
      date: {
        start: normalizeUtcDateTimeValue(value),
        time_zone: "Etc/UTC",
      },
    };
  }

  return { date: { start: value } };
}

function normalizeUtcDateTimeValue(value: string) {
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value).toISOString().slice(0, 19);
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }

  return value;
}

function combineDateAndTime(date?: string | null, time?: string | null) {
  if (!date) {
    return "";
  }

  const normalizedTime = normalizeTimeValue(time);
  return normalizedTime ? `${date}T${normalizedTime}` : date;
}

function normalizeTimeValue(value?: string | null) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return "";
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }

  return trimmed;
}

function getDatePart(value?: string | null) {
  if (!value) {
    return null;
  }

  return value.slice(0, 10);
}

function getTimePart(value?: string | null) {
  if (!value || !value.includes("T")) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const match = value.match(/T(\d{2}:\d{2})/);
    return match?.[1] ?? "";
  }

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function relationProperty(id: string) {
  return { relation: [{ id }] };
}

async function getDataSourcePropertyNames(dataSourceId: string) {
  const client = getClient();
  const response = await client.dataSources.retrieve({ data_source_id: dataSourceId } as any);
  return new Set(Object.keys((response as any).properties ?? {}));
}

function filterPropertiesBySchema<T extends Record<string, any>>(properties: T, allowedPropertyNames: Set<string>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([propertyName]) => allowedPropertyNames.has(propertyName)),
  ) as Partial<T>;
}

function getTitle(properties: Record<string, any>, name: string) {
  const property = properties[name];
  if (!property || property.type !== "title") {
    return "";
  }

  return property.title.map((entry: any) => entry.plain_text).join("");
}

function getRichText(properties: Record<string, any>, name: string) {
  const property = properties[name];
  if (!property || property.type !== "rich_text") {
    return "";
  }

  return property.rich_text.map((entry: any) => entry.plain_text).join("");
}

function getSelect(properties: Record<string, any>, name: string) {
  const property = properties[name];
  if (!property || property.type !== "select") {
    return "";
  }

  return property.select?.name ?? "";
}

function getUrl(properties: Record<string, any>, name: string) {
  const property = properties[name];
  if (!property || property.type !== "url") {
    return "";
  }

  return property.url ?? "";
}

function getNumber(properties: Record<string, any>, name: string) {
  const property = properties[name];
  if (!property || property.type !== "number") {
    return null;
  }

  return property.number ?? null;
}

function getDate(properties: Record<string, any>, name: string) {
  const property = properties[name];
  if (!property || property.type !== "date") {
    return null;
  }

  return property.date?.start ?? null;
}

function getRelation(properties: Record<string, any>, name: string) {
  const property = properties[name];
  if (!property || property.type !== "relation") {
    return [];
  }

  return property.relation.map((entry: any) => entry.id);
}

async function queryAllDataSourcePages(args: Record<string, any>) {
  const client = getClient();
  const results: any[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.dataSources.query({
      ...args,
      start_cursor: cursor,
    } as any);
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return results;
}

async function queryTripScopedPages(dataSourceId: string, tripId: string, relationName: string, sorts?: any[]) {
  return queryAllDataSourcePages({
    data_source_id: dataSourceId,
    filter: {
      property: relationName,
      relation: {
        contains: tripId,
      },
    },
    sorts,
  });
}

export function getNotionStatus(): SetupStatus {
  return getSetupStatus();
}

export async function listTrips() {
  const status = getNotionStatus();
  if (!status.configured) {
    return [];
  }

  const results = await queryAllDataSourcePages({
    data_source_id: getRequiredEnv("NOTION_TRIPS_DB_ID"),
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  });

  return results.map((page) => mapTrip(page.properties, page.id));
}

export async function getTripDetail(tripId: string): Promise<TripDetail | null> {
  const status = getNotionStatus();
  if (!status.configured) {
    return null;
  }

  const client = getClient();
  const tripPage = (await client.pages.retrieve({ page_id: tripId })) as any;
  const trip = mapTrip(tripPage.properties, tripPage.id);

  const dayResults = await queryTripScopedPages(getRequiredEnv("NOTION_DAYS_DB_ID"), tripId, DAY_PROPS.trip, [
    { property: DAY_PROPS.date, direction: "ascending" },
    { property: DAY_PROPS.dayNumber, direction: "ascending" },
  ]);
  const days = dayResults.map((page) => mapDay(page.properties, page.id));
  const dayIds = days.map((day) => day.id);

  let itemResults: any[] = [];
  if (dayIds.length > 0) {
    itemResults = await queryAllDataSourcePages({
      data_source_id: getRequiredEnv("NOTION_ITEMS_DB_ID"),
      filter: {
        or: dayIds.map((dayId) => ({
          property: ITEM_PROPS.day,
          relation: {
            contains: dayId,
          },
        })),
      },
      sorts: [
        { property: ITEM_PROPS.order, direction: "ascending" },
        { property: ITEM_PROPS.startTime, direction: "ascending" },
      ],
    });
  }

  const [flightResults, stayResults, expenseResults] = await Promise.all([
    queryTripScopedPages(getRequiredEnv("NOTION_FLIGHTS_DB_ID"), tripId, FLIGHT_PROPS.trip, [
      { property: FLIGHT_PROPS.departureAt, direction: "ascending" },
    ]),
    queryTripScopedPages(getRequiredEnv("NOTION_STAYS_DB_ID"), tripId, STAY_PROPS.trip, [
      { property: STAY_PROPS.checkInDate, direction: "ascending" },
    ]),
    queryTripScopedPages(getRequiredEnv("NOTION_EXPENSES_DB_ID"), tripId, EXPENSE_PROPS.trip, [
      { property: EXPENSE_PROPS.date, direction: "ascending" },
    ]),
  ]);

  const items = itemResults.map((page) => mapItem(page.properties, page.id));
  const itemsByDay = new Map<string, TripItem[]>();

  for (const item of items) {
    const current = itemsByDay.get(item.dayId) ?? [];
    current.push(item);
    itemsByDay.set(item.dayId, current);
  }

  return {
    trip,
    days: days.map((day) => ({
      ...day,
      items: itemsByDay.get(day.id) ?? [],
    })),
    flights: flightResults.map((page) => mapFlight(page.properties, page.id)),
    stays: stayResults.map((page) => mapStay(page.properties, page.id)),
    expenses: expenseResults.map((page) => mapExpense(page.properties, page.id)),
  };
}

export async function createTrip(input: {
  destination: string;
  startDate: string;
  endDate: string;
  notes: string;
}) {
  const client = getClient();

  await client.pages.create({
    parent: { data_source_id: getRequiredEnv("NOTION_TRIPS_DB_ID") },
    properties: {
      [TRIP_PROPS.destination]: titleProperty(input.destination),
      [TRIP_PROPS.startDate]: dateProperty(input.startDate),
      [TRIP_PROPS.endDate]: dateProperty(input.endDate),
      [TRIP_PROPS.notes]: richTextProperty(input.notes),
    },
  } as CreatePageParameters);
}

export async function updateTrip(
  tripId: string,
  input: {
    destination: string;
    startDate: string;
    endDate: string;
    notes: string;
  },
) {
  const client = getClient();

  await client.pages.update({
    page_id: tripId,
    properties: {
      [TRIP_PROPS.destination]: titleProperty(input.destination),
      [TRIP_PROPS.startDate]: dateProperty(input.startDate),
      [TRIP_PROPS.endDate]: dateProperty(input.endDate),
      [TRIP_PROPS.notes]: richTextProperty(input.notes),
    },
  } as any);
}

export async function createDay(input: {
  tripId: string;
  title: string;
  date: string;
  dayNumber: number;
  summary: string;
}) {
  const client = getClient();

  await client.pages.create({
    parent: { data_source_id: getRequiredEnv("NOTION_DAYS_DB_ID") },
    properties: {
      [DAY_PROPS.title]: titleProperty(input.title),
      [DAY_PROPS.trip]: relationProperty(input.tripId),
      [DAY_PROPS.date]: dateProperty(input.date),
      [DAY_PROPS.dayNumber]: {
        number: input.dayNumber,
      },
      [DAY_PROPS.summary]: richTextProperty(input.summary),
    },
  } as CreatePageParameters);
}

export async function createItem(input: {
  dayId: string;
  title: string;
  type: ItemType;
  startTime: string;
  endTime: string;
  location: string;
  cost: number | null;
  url: string;
  notes: string;
  order: number;
}) {
  const client = getClient();

  await client.pages.create({
    parent: { data_source_id: getRequiredEnv("NOTION_ITEMS_DB_ID") },
    properties: {
      [ITEM_PROPS.title]: titleProperty(input.title),
      [ITEM_PROPS.day]: relationProperty(input.dayId),
      [ITEM_PROPS.startTime]: richTextProperty(input.startTime),
      [ITEM_PROPS.endTime]: richTextProperty(input.endTime),
      [ITEM_PROPS.type]: {
        select: { name: input.type },
      },
      [ITEM_PROPS.location]: richTextProperty(input.location),
      [ITEM_PROPS.cost]: {
        number: input.cost,
      },
      [ITEM_PROPS.url]: {
        url: input.url || null,
      },
      [ITEM_PROPS.notes]: richTextProperty(input.notes),
      [ITEM_PROPS.order]: {
        number: input.order,
      },
    },
  } as CreatePageParameters);
}

export async function updateItem(
  itemId: string,
  input: {
    title: string;
    type: ItemType;
    startTime: string;
    endTime: string;
    location: string;
    cost: number | null;
    url: string;
    notes: string;
    order: number;
  },
) {
  const client = getClient();

  await client.pages.update({
    page_id: itemId,
    properties: {
      [ITEM_PROPS.title]: titleProperty(input.title),
      [ITEM_PROPS.startTime]: richTextProperty(input.startTime),
      [ITEM_PROPS.endTime]: richTextProperty(input.endTime),
      [ITEM_PROPS.type]: {
        select: { name: input.type },
      },
      [ITEM_PROPS.location]: richTextProperty(input.location),
      [ITEM_PROPS.cost]: {
        number: input.cost,
      },
      [ITEM_PROPS.url]: {
        url: input.url || null,
      },
      [ITEM_PROPS.notes]: richTextProperty(input.notes),
      [ITEM_PROPS.order]: {
        number: input.order,
      },
    },
  } as any);
}

export async function createFlight(input: Omit<TripFlight, "id">) {
  const client = getClient();

  await client.pages.create({
    parent: { data_source_id: getRequiredEnv("NOTION_FLIGHTS_DB_ID") },
    properties: {
      [FLIGHT_PROPS.title]: titleProperty(getFlightDisplayLabel(input)),
      [FLIGHT_PROPS.trip]: relationProperty(input.tripId),
      [FLIGHT_PROPS.airline]: richTextProperty(input.airline),
      [FLIGHT_PROPS.flightNumber]: richTextProperty(input.flightNumber),
      [FLIGHT_PROPS.departureAirport]: richTextProperty(input.departureAirport),
      [FLIGHT_PROPS.arrivalAirport]: richTextProperty(input.arrivalAirport),
      [FLIGHT_PROPS.departureAt]: dateProperty(input.departureAt),
      [FLIGHT_PROPS.arrivalAt]: dateProperty(input.arrivalAt),
      [FLIGHT_PROPS.aircraft]: richTextProperty(input.aircraft),
      [FLIGHT_PROPS.baggageInfo]: richTextProperty(input.baggageInfo),
      [FLIGHT_PROPS.cost]: {
        number: input.cost,
      },
      [FLIGHT_PROPS.passengers]: richTextProperty(serializeFlightPassengers(input.passengers)),
      [FLIGHT_PROPS.notes]: richTextProperty(input.notes),
    },
  } as CreatePageParameters);
}

export async function updateFlight(
  flightId: string,
  input: Omit<TripFlight, "id" | "tripId">,
) {
  const client = getClient();

  await client.pages.update({
    page_id: flightId,
    properties: {
      [FLIGHT_PROPS.title]: titleProperty(getFlightDisplayLabel(input)),
      [FLIGHT_PROPS.airline]: richTextProperty(input.airline),
      [FLIGHT_PROPS.flightNumber]: richTextProperty(input.flightNumber),
      [FLIGHT_PROPS.departureAirport]: richTextProperty(input.departureAirport),
      [FLIGHT_PROPS.arrivalAirport]: richTextProperty(input.arrivalAirport),
      [FLIGHT_PROPS.departureAt]: dateProperty(input.departureAt),
      [FLIGHT_PROPS.arrivalAt]: dateProperty(input.arrivalAt),
      [FLIGHT_PROPS.aircraft]: richTextProperty(input.aircraft),
      [FLIGHT_PROPS.baggageInfo]: richTextProperty(input.baggageInfo),
      [FLIGHT_PROPS.cost]: {
        number: input.cost,
      },
      [FLIGHT_PROPS.passengers]: richTextProperty(serializeFlightPassengers(input.passengers)),
      [FLIGHT_PROPS.notes]: richTextProperty(input.notes),
    },
  } as any);
}

export async function createStay(input: Omit<TripStay, "id">) {
  const client = getClient();
  const dataSourceId = getRequiredEnv("NOTION_STAYS_DB_ID");
  const allowedPropertyNames = await getDataSourcePropertyNames(dataSourceId);
  const properties = filterPropertiesBySchema(
    {
      [STAY_PROPS.title]: titleProperty(input.title),
      [STAY_PROPS.trip]: relationProperty(input.tripId),
      [STAY_PROPS.checkInDate]: dateProperty(
        combineDateAndTime(input.checkInDate, input.checkInTime),
      ),
      [STAY_PROPS.checkOutDate]: dateProperty(
        combineDateAndTime(input.checkOutDate, input.checkOutTime),
      ),
      [STAY_PROPS.cost]: {
        number: input.cost,
      },
      [STAY_PROPS.address]: richTextProperty(input.address),
      [STAY_PROPS.url]: {
        url: input.url || null,
      },
      [STAY_PROPS.bookingReference]: richTextProperty(input.bookingReference),
      [STAY_PROPS.notes]: richTextProperty(input.notes),
    },
    allowedPropertyNames,
  );

  await client.pages.create({
    parent: { data_source_id: dataSourceId },
    properties,
  } as CreatePageParameters);
}

export async function updateStay(
  stayId: string,
  input: Omit<TripStay, "id" | "tripId">,
) {
  const client = getClient();
  const dataSourceId = getRequiredEnv("NOTION_STAYS_DB_ID");
  const allowedPropertyNames = await getDataSourcePropertyNames(dataSourceId);
  const properties = filterPropertiesBySchema(
    {
      [STAY_PROPS.title]: titleProperty(input.title),
      [STAY_PROPS.checkInDate]: dateProperty(
        combineDateAndTime(input.checkInDate, input.checkInTime),
      ),
      [STAY_PROPS.checkOutDate]: dateProperty(
        combineDateAndTime(input.checkOutDate, input.checkOutTime),
      ),
      [STAY_PROPS.cost]: {
        number: input.cost,
      },
      [STAY_PROPS.address]: richTextProperty(input.address),
      [STAY_PROPS.url]: {
        url: input.url || null,
      },
      [STAY_PROPS.bookingReference]: richTextProperty(input.bookingReference),
      [STAY_PROPS.notes]: richTextProperty(input.notes),
    },
    allowedPropertyNames,
  );

  await client.pages.update({
    page_id: stayId,
    properties,
  } as any);
}

export async function createExpense(input: Omit<TripExpense, "id">) {
  const client = getClient();

  await client.pages.create({
    parent: { data_source_id: getRequiredEnv("NOTION_EXPENSES_DB_ID") },
    properties: {
      [EXPENSE_PROPS.title]: titleProperty(input.title),
      [EXPENSE_PROPS.trip]: relationProperty(input.tripId),
      [EXPENSE_PROPS.date]: dateProperty(input.date),
      [EXPENSE_PROPS.cost]: {
        number: input.cost,
      },
      [EXPENSE_PROPS.taxRefund]: {
        number: input.taxRefund,
      },
    },
  } as CreatePageParameters);
}

export async function updateExpense(
  expenseId: string,
  input: Omit<TripExpense, "id" | "tripId">,
) {
  const client = getClient();

  await client.pages.update({
    page_id: expenseId,
    properties: {
      [EXPENSE_PROPS.title]: titleProperty(input.title),
      [EXPENSE_PROPS.date]: dateProperty(input.date),
      [EXPENSE_PROPS.cost]: {
        number: input.cost,
      },
      [EXPENSE_PROPS.taxRefund]: {
        number: input.taxRefund,
      },
    },
  } as any);
}

export async function archivePage(pageId: string) {
  const client = getClient();
  await client.pages.update({
    page_id: pageId,
    archived: true,
  });
}

export function getTripStats(detail: TripDetail) {
  return {
    days: detail.days.length,
    items: detail.days.flatMap((day) => day.items).length,
    flights: detail.flights.length,
    stays: detail.stays.length,
    totalCost: sum([
      ...detail.days.flatMap((day) => day.items.map((item) => item.cost)),
      ...detail.flights.map((flight) => flight.cost),
      ...detail.stays.map((stay) => stay.cost),
      ...detail.expenses.map((expense) => expense.cost),
    ]),
    totalTaxRefund: sum(detail.expenses.map((expense) => expense.taxRefund)),
  };
}

function mapTrip(properties: Record<string, any>, id: string): Trip {
  return {
    id,
    destination: getTitle(properties, TRIP_PROPS.destination),
    startDate: getDate(properties, TRIP_PROPS.startDate),
    endDate: getDate(properties, TRIP_PROPS.endDate),
    notes: getRichText(properties, TRIP_PROPS.notes),
  };
}

function mapDay(properties: Record<string, any>, id: string): TripDay {
  const [tripId] = getRelation(properties, DAY_PROPS.trip);

  return {
    id,
    tripId: tripId ?? "",
    title: getTitle(properties, DAY_PROPS.title),
    date: getDate(properties, DAY_PROPS.date),
    dayNumber: getNumber(properties, DAY_PROPS.dayNumber) ?? 0,
    summary: getRichText(properties, DAY_PROPS.summary),
  };
}

function mapItem(properties: Record<string, any>, id: string): TripItem {
  const [dayId] = getRelation(properties, ITEM_PROPS.day);

  return {
    id,
    dayId: dayId ?? "",
    title: getTitle(properties, ITEM_PROPS.title),
    type: normalizeItemType(getSelect(properties, ITEM_PROPS.type)) as ItemType,
    startTime: getRichText(properties, ITEM_PROPS.startTime),
    endTime: getRichText(properties, ITEM_PROPS.endTime),
    location: getRichText(properties, ITEM_PROPS.location),
    cost: getNumber(properties, ITEM_PROPS.cost),
    url: getUrl(properties, ITEM_PROPS.url),
    notes: getRichText(properties, ITEM_PROPS.notes),
    order: getNumber(properties, ITEM_PROPS.order) ?? 0,
  };
}

function normalizeItemType(value: string): ItemType {
  switch (value) {
    case "景點":
      return "Sightseeing";
    case "交通":
      return "Transit";
    case "住宿":
      return "Stay";
    case "餐廳":
      return "Food";
    case "購物":
      return "Shopping";
    case "提醒":
      return "Reminder";
    case "其他":
    default:
      return "Other";
  }
}

function mapFlight(properties: Record<string, any>, id: string): TripFlight {
  const [tripId] = getRelation(properties, FLIGHT_PROPS.trip);

  return {
    id,
    tripId: tripId ?? "",
    airline: getRichText(properties, FLIGHT_PROPS.airline),
    flightNumber: getRichText(properties, FLIGHT_PROPS.flightNumber),
    departureAirport: getRichText(properties, FLIGHT_PROPS.departureAirport),
    arrivalAirport: getRichText(properties, FLIGHT_PROPS.arrivalAirport),
    departureAt: getDate(properties, FLIGHT_PROPS.departureAt),
    arrivalAt: getDate(properties, FLIGHT_PROPS.arrivalAt),
    aircraft: getRichText(properties, FLIGHT_PROPS.aircraft),
    baggageInfo: getRichText(properties, FLIGHT_PROPS.baggageInfo),
    cost: getNumber(properties, FLIGHT_PROPS.cost),
    passengers: parseFlightPassengers(getRichText(properties, FLIGHT_PROPS.passengers)),
    notes: getRichText(properties, FLIGHT_PROPS.notes),
  };
}

function mapStay(properties: Record<string, any>, id: string): TripStay {
  const [tripId] = getRelation(properties, STAY_PROPS.trip);
  const checkInAt = getDate(properties, STAY_PROPS.checkInDate);
  const checkOutAt = getDate(properties, STAY_PROPS.checkOutDate);

  return {
    id,
    tripId: tripId ?? "",
    title: getTitle(properties, STAY_PROPS.title),
    checkInDate: getDatePart(checkInAt),
    checkOutDate: getDatePart(checkOutAt),
    checkInTime: getTimePart(checkInAt),
    checkOutTime: getTimePart(checkOutAt),
    cost: getNumber(properties, STAY_PROPS.cost),
    address: getRichText(properties, STAY_PROPS.address),
    url: getUrl(properties, STAY_PROPS.url),
    bookingReference: getRichText(properties, STAY_PROPS.bookingReference),
    notes: getRichText(properties, STAY_PROPS.notes),
  };
}

function mapExpense(properties: Record<string, any>, id: string): TripExpense {
  const [tripId] = getRelation(properties, EXPENSE_PROPS.trip);

  return {
    id,
    tripId: tripId ?? "",
    title: getTitle(properties, EXPENSE_PROPS.title),
    date: getDate(properties, EXPENSE_PROPS.date),
    cost: getNumber(properties, EXPENSE_PROPS.cost),
    taxRefund: getNumber(properties, EXPENSE_PROPS.taxRefund),
  };
}
