export type TripStatus = "規劃中" | "已預訂" | "旅行中" | "已完成";

export type ItemType =
  | "景點"
  | "交通"
  | "住宿"
  | "餐廳"
  | "購物"
  | "提醒"
  | "其他";

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  status: TripStatus;
  cover: string;
  notes: string;
}

export interface TripDay {
  id: string;
  tripId: string;
  title: string;
  date: string | null;
  dayNumber: number;
  summary: string;
}

export interface TripItem {
  id: string;
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
}

export interface TripDetail {
  trip: Trip;
  days: Array<
    TripDay & {
      items: TripItem[];
    }
  >;
}

export interface SetupStatus {
  configured: boolean;
  missing: string[];
}

