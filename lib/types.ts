export type ItemType =
  | "Sightseeing"
  | "Transit"
  | "Stay"
  | "Food"
  | "Shopping"
  | "Reminder"
  | "Other";

export type TripSectionTab =
  | "overview"
  | "itinerary"
  | "flights"
  | "stays"
  | "expenses";

export type CurrencyCode = string;

export interface Trip {
  id: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  baseCurrency: CurrencyCode;
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
  currency: CurrencyCode;
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
  cost: number | null;
  currency: CurrencyCode;
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
  cost: number | null;
  currency: CurrencyCode;
  address: string;
  url: string;
  bookingReference: string;
  notes: string;
}

export interface TripExpense {
  id: string;
  tripId: string;
  title: string;
  date: string | null;
  cost: number | null;
  currency: CurrencyCode;
  taxRefund: number | null;
}

export interface TripCurrencyRate {
  id: string;
  tripId: string;
  title: string;
  currency: CurrencyCode;
  rate: number | null;
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
  expenses: TripExpense[];
  currencyRates: TripCurrencyRate[];
}

export interface SetupStatus {
  configured: boolean;
  missing: string[];
}
