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
  TripFlight,
  TripItem,
  TripStay,
  TripStatus,
} from "@/lib/types";
import { sum } from "@/lib/utils";

const TRIP_PROPS = {
  title: "名稱",
  destination: "目的地",
  startDate: "開始日期",
  endDate: "結束日期",
  status: "狀態",
  cover: "封面",
  notes: "備註",
} as const;

const DAY_PROPS = {
  title: "名稱",
  trip: "旅程",
  date: "日期",
  dayNumber: "天次",
  summary: "摘要",
} as const;

const ITEM_PROPS = {
  title: "名稱",
  day: "Day",
  startTime: "開始時間",
  endTime: "結束時間",
  type: "類型",
  location: "地點",
  cost: "費用",
  url: "網址",
  notes: "備註",
  order: "排序",
} as const;

const FLIGHT_PROPS = {
  title: "名稱",
  trip: "旅程",
  airline: "航空公司",
  flightNumber: "航班號碼",
  departureAirport: "出發機場",
  arrivalAirport: "抵達機場",
  departureAt: "出發時間",
  arrivalAt: "抵達時間",
  aircraft: "機型",
  baggageInfo: "行李資訊",
  cost: "費用",
  passengers: "乘客資訊",
  notes: "備註",
} as const;

const STAY_PROPS = {
  title: "名稱",
  trip: "旅程",
  checkInDate: "入住日期",
  checkOutDate: "退房日期",
  checkInTime: "入住時間",
  checkOutTime: "退房時間",
  cost: "費用",
  address: "地址",
  bookingReference: "訂房代碼",
  notes: "備註",
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

function dateProperty(value?: string | null, timeZone?: string | null) {
  if (!value) {
    return { date: null };
  }

  if (timeZone && value.includes("T") && !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
    return {
      date: {
        start: localDateTimeToUtcIso(value, timeZone),
      },
    };
  }

  return { date: { start: value } };
}

function localDateTimeToUtcIso(value: string, timeZone: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return value;
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  const desiredUtcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  let utcGuess = desiredUtcMs;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date(utcGuess));

    const getPart = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value ?? "0");

    const actualUtcMs = Date.UTC(
      getPart("year"),
      getPart("month") - 1,
      getPart("day"),
      getPart("hour"),
      getPart("minute"),
      getPart("second"),
    );

    const diff = desiredUtcMs - actualUtcMs;
    if (diff === 0) {
      break;
    }

    utcGuess += diff;
  }

  return new Date(utcGuess).toISOString();
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

  const [flightResults, stayResults] = await Promise.all([
    queryTripScopedPages(getRequiredEnv("NOTION_FLIGHTS_DB_ID"), tripId, FLIGHT_PROPS.trip, [
      { property: FLIGHT_PROPS.departureAt, direction: "ascending" },
    ]),
    queryTripScopedPages(getRequiredEnv("NOTION_STAYS_DB_ID"), tripId, STAY_PROPS.trip, [
      { property: STAY_PROPS.checkInDate, direction: "ascending" },
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
  };
}

export async function createTrip(input: {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  cover: string;
  notes: string;
}) {
  const client = getClient();

  await client.pages.create({
    parent: { data_source_id: getRequiredEnv("NOTION_TRIPS_DB_ID") },
    properties: {
      [TRIP_PROPS.title]: titleProperty(input.title),
      [TRIP_PROPS.destination]: richTextProperty(input.destination),
      [TRIP_PROPS.startDate]: dateProperty(input.startDate),
      [TRIP_PROPS.endDate]: dateProperty(input.endDate),
      [TRIP_PROPS.status]: {
        select: { name: input.status },
      },
      [TRIP_PROPS.cover]: {
        url: input.cover || null,
      },
      [TRIP_PROPS.notes]: richTextProperty(input.notes),
    },
  } as CreatePageParameters);
}

export async function updateTrip(
  tripId: string,
  input: {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    status: TripStatus;
    cover: string;
    notes: string;
  },
) {
  const client = getClient();

  await client.pages.update({
    page_id: tripId,
    properties: {
      [TRIP_PROPS.title]: titleProperty(input.title),
      [TRIP_PROPS.destination]: richTextProperty(input.destination),
      [TRIP_PROPS.startDate]: dateProperty(input.startDate),
      [TRIP_PROPS.endDate]: dateProperty(input.endDate),
      [TRIP_PROPS.status]: {
        select: { name: input.status },
      },
      [TRIP_PROPS.cover]: {
        url: input.cover || null,
      },
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

export async function createFlight(input: Omit<TripFlight, "id">, timeZone?: string | null) {
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
      [FLIGHT_PROPS.departureAt]: dateProperty(input.departureAt, timeZone),
      [FLIGHT_PROPS.arrivalAt]: dateProperty(input.arrivalAt, timeZone),
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

export async function updateFlight(flightId: string, input: Omit<TripFlight, "id" | "tripId">, timeZone?: string | null) {
  const client = getClient();

  await client.pages.update({
    page_id: flightId,
    properties: {
      [FLIGHT_PROPS.title]: titleProperty(getFlightDisplayLabel(input)),
      [FLIGHT_PROPS.airline]: richTextProperty(input.airline),
      [FLIGHT_PROPS.flightNumber]: richTextProperty(input.flightNumber),
      [FLIGHT_PROPS.departureAirport]: richTextProperty(input.departureAirport),
      [FLIGHT_PROPS.arrivalAirport]: richTextProperty(input.arrivalAirport),
      [FLIGHT_PROPS.departureAt]: dateProperty(input.departureAt, timeZone),
      [FLIGHT_PROPS.arrivalAt]: dateProperty(input.arrivalAt, timeZone),
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
      [STAY_PROPS.checkInDate]: dateProperty(input.checkInDate ?? ""),
      [STAY_PROPS.checkOutDate]: dateProperty(input.checkOutDate ?? ""),
      [STAY_PROPS.checkInTime]: richTextProperty(input.checkInTime),
      [STAY_PROPS.checkOutTime]: richTextProperty(input.checkOutTime),
      [STAY_PROPS.cost]: {
        number: input.cost,
      },
      [STAY_PROPS.address]: richTextProperty(input.address),
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

export async function updateStay(stayId: string, input: Omit<TripStay, "id" | "tripId">) {
  const client = getClient();
  const dataSourceId = getRequiredEnv("NOTION_STAYS_DB_ID");
  const allowedPropertyNames = await getDataSourcePropertyNames(dataSourceId);
  const properties = filterPropertiesBySchema(
    {
      [STAY_PROPS.title]: titleProperty(input.title),
      [STAY_PROPS.checkInDate]: dateProperty(input.checkInDate ?? ""),
      [STAY_PROPS.checkOutDate]: dateProperty(input.checkOutDate ?? ""),
      [STAY_PROPS.checkInTime]: richTextProperty(input.checkInTime),
      [STAY_PROPS.checkOutTime]: richTextProperty(input.checkOutTime),
      [STAY_PROPS.cost]: {
        number: input.cost,
      },
      [STAY_PROPS.address]: richTextProperty(input.address),
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
    ]),
  };
}

function mapTrip(properties: Record<string, any>, id: string): Trip {
  return {
    id,
    title: getTitle(properties, TRIP_PROPS.title),
    destination: getRichText(properties, TRIP_PROPS.destination),
    startDate: getDate(properties, TRIP_PROPS.startDate),
    endDate: getDate(properties, TRIP_PROPS.endDate),
    status: (getSelect(properties, TRIP_PROPS.status) || "規劃中") as TripStatus,
    cover: getUrl(properties, TRIP_PROPS.cover),
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
    type: (getSelect(properties, ITEM_PROPS.type) || "其他") as ItemType,
    startTime: getRichText(properties, ITEM_PROPS.startTime),
    endTime: getRichText(properties, ITEM_PROPS.endTime),
    location: getRichText(properties, ITEM_PROPS.location),
    cost: getNumber(properties, ITEM_PROPS.cost),
    url: getUrl(properties, ITEM_PROPS.url),
    notes: getRichText(properties, ITEM_PROPS.notes),
    order: getNumber(properties, ITEM_PROPS.order) ?? 0,
  };
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

  return {
    id,
    tripId: tripId ?? "",
    title: getTitle(properties, STAY_PROPS.title),
    checkInDate: getDate(properties, STAY_PROPS.checkInDate),
    checkOutDate: getDate(properties, STAY_PROPS.checkOutDate),
    checkInTime: getRichText(properties, STAY_PROPS.checkInTime),
    checkOutTime: getRichText(properties, STAY_PROPS.checkOutTime),
    cost: getNumber(properties, STAY_PROPS.cost),
    address: getRichText(properties, STAY_PROPS.address),
    bookingReference: getRichText(properties, STAY_PROPS.bookingReference),
    notes: getRichText(properties, STAY_PROPS.notes),
  };
}
