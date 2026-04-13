import { Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

import { getRequiredEnv, getSetupStatus } from "@/lib/env";
import type { ItemType, SetupStatus, Trip, TripDay, TripDetail, TripItem, TripStatus } from "@/lib/types";
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

function getClient() {
  return new Client({ auth: getRequiredEnv("NOTION_TOKEN") });
}

function richText(content: string) {
  return [{ type: "text" as const, text: { content } }];
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

async function queryAllDatabasePages(args: Record<string, any>) {
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

export function getNotionStatus(): SetupStatus {
  return getSetupStatus();
}

export async function listTrips() {
  const status = getNotionStatus();
  if (!status.configured) {
    return [];
  }

  const results = await queryAllDatabasePages({
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

  const dayResults = await queryAllDatabasePages({
    data_source_id: getRequiredEnv("NOTION_DAYS_DB_ID"),
    filter: {
      property: DAY_PROPS.trip,
      relation: {
        contains: tripId,
      },
    },
    sorts: [
      { property: DAY_PROPS.date, direction: "ascending" },
      { property: DAY_PROPS.dayNumber, direction: "ascending" },
    ],
  });

  const days = dayResults.map((page) => mapDay(page.properties, page.id));
  const dayIds = days.map((day) => day.id);

  let itemResults: any[] = [];
  if (dayIds.length > 0) {
    itemResults = await queryAllDatabasePages({
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
      [TRIP_PROPS.title]: {
        title: richText(input.title),
      },
      [TRIP_PROPS.destination]: {
        rich_text: richText(input.destination),
      },
      [TRIP_PROPS.startDate]: input.startDate
        ? { date: { start: input.startDate } }
        : { date: null },
      [TRIP_PROPS.endDate]: input.endDate
        ? { date: { start: input.endDate } }
        : { date: null },
      [TRIP_PROPS.status]: {
        select: { name: input.status },
      },
      [TRIP_PROPS.cover]: {
        url: input.cover || null,
      },
      [TRIP_PROPS.notes]: {
        rich_text: input.notes ? richText(input.notes) : [],
      },
    },
  } as CreatePageParameters);
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
      [DAY_PROPS.title]: {
        title: richText(input.title),
      },
      [DAY_PROPS.trip]: {
        relation: [{ id: input.tripId }],
      },
      [DAY_PROPS.date]: input.date ? { date: { start: input.date } } : { date: null },
      [DAY_PROPS.dayNumber]: {
        number: input.dayNumber,
      },
      [DAY_PROPS.summary]: {
        rich_text: input.summary ? richText(input.summary) : [],
      },
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
      [ITEM_PROPS.title]: {
        title: richText(input.title),
      },
      [ITEM_PROPS.day]: {
        relation: [{ id: input.dayId }],
      },
      [ITEM_PROPS.startTime]: {
        rich_text: input.startTime ? richText(input.startTime) : [],
      },
      [ITEM_PROPS.endTime]: {
        rich_text: input.endTime ? richText(input.endTime) : [],
      },
      [ITEM_PROPS.type]: {
        select: { name: input.type },
      },
      [ITEM_PROPS.location]: {
        rich_text: input.location ? richText(input.location) : [],
      },
      [ITEM_PROPS.cost]: {
        number: input.cost,
      },
      [ITEM_PROPS.url]: {
        url: input.url || null,
      },
      [ITEM_PROPS.notes]: {
        rich_text: input.notes ? richText(input.notes) : [],
      },
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
      [ITEM_PROPS.title]: {
        title: richText(input.title),
      },
      [ITEM_PROPS.startTime]: {
        rich_text: input.startTime ? richText(input.startTime) : [],
      },
      [ITEM_PROPS.endTime]: {
        rich_text: input.endTime ? richText(input.endTime) : [],
      },
      [ITEM_PROPS.type]: {
        select: { name: input.type },
      },
      [ITEM_PROPS.location]: {
        rich_text: input.location ? richText(input.location) : [],
      },
      [ITEM_PROPS.cost]: {
        number: input.cost,
      },
      [ITEM_PROPS.url]: {
        url: input.url || null,
      },
      [ITEM_PROPS.notes]: {
        rich_text: input.notes ? richText(input.notes) : [],
      },
      [ITEM_PROPS.order]: {
        number: input.order,
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
    budget: sum(detail.days.flatMap((day) => day.items.map((item) => item.cost))),
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
