import type { SetupStatus } from "@/lib/types";

const REQUIRED_APP_ENV = [
  "NOTION_TOKEN",
  "NOTION_TRIPS_DB_ID",
  "NOTION_DAYS_DB_ID",
  "NOTION_ITEMS_DB_ID",
  "NOTION_FLIGHTS_DB_ID",
  "NOTION_STAYS_DB_ID",
  "APP_PASSWORD",
  "SESSION_SECRET",
] as const;

export const SESSION_COOKIE = "travel_planner_session";

export function getSetupStatus(): SetupStatus {
  const missing = REQUIRED_APP_ENV.filter((key) => !process.env[key]);

  return {
    configured: missing.length === 0,
    missing,
  };
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`缺少必要環境變數：${name}`);
  }

  return value;
}
