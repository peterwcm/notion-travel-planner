export type TripStatus = "規劃中" | "已預訂" | "旅行中" | "已完成";

export type ItemType =
  | "景點"
  | "交通"
  | "住宿"
  | "餐廳"
  | "購物"
  | "其他";

export type TripSectionTab = "overview" | "itinerary" | "flights" | "stays";

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

export interface TripFlightPassenger {
  fullName: string;
  bookingReference: string;
  ticketNumber: string;
}

export interface TripFlight {
  id: string;
  tripId: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureAt: string | null;
  arrivalAt: string | null;
  aircraft: string;
  baggageInfo: string;
  passengers: TripFlightPassenger[];
  notes: string;
}

export interface TripStay {
  id: string;
  tripId: string;
  title: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  checkInTime: string;
  checkOutTime: string;
  address: string;
  bookingReference: string;
  notes: string;
}

export interface TripDetail {
  trip: Trip;
  days: Array<
    TripDay & {
      items: TripItem[];
    }
  >;
  flights: TripFlight[];
  stays: TripStay[];
}

export interface SetupStatus {
  configured: boolean;
  missing: string[];
}
