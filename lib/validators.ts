import { z } from "zod";

export const loginSchema = z.object({
  password: z.string().min(1, "Enter the password."),
});

export const tripSchema = z.object({
  destination: z.string().min(1, "Enter a destination."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export const daySchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1, "Enter a day title."),
  date: z.string().optional(),
  dayNumber: z.coerce.number().int().positive("Day number must be greater than 0."),
  summary: z.string().optional(),
});

export const itemSchema = z.object({
  dayId: z.string().min(1),
  title: z.string().min(1, "Enter an item name."),
  type: z.enum(["Sightseeing", "Transit", "Stay", "Food", "Shopping", "Reminder", "Other"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  cost: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null)),
  url: z.string().optional(),
  notes: z.string().optional(),
  order: z.coerce.number().int().min(0),
});

const flightPassengerSchema = z.object({
  fullName: z.string().optional().transform((value) => value ?? ""),
  bookingReference: z.string().optional().transform((value) => value ?? ""),
  ticketNumber: z.string().optional().transform((value) => value ?? ""),
});

export const flightSchema = z.object({
  tripId: z.string().min(1),
  airline: z.string().min(1, "Enter an airline."),
  flightNumber: z.string().min(1, "Enter a flight number."),
  departureAirport: z.string().min(1, "Enter a departure airport."),
  arrivalAirport: z.string().min(1, "Enter an arrival airport."),
  departureAt: z.string().min(1, "Enter a departure time."),
  arrivalAt: z.string().min(1, "Enter an arrival time."),
  aircraft: z.string().optional(),
  baggageInfo: z.string().optional(),
  cost: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null)),
  passengers: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return [];
      }

      const parsed = JSON.parse(value);
      return z.array(flightPassengerSchema).parse(parsed);
    }),
  notes: z.string().optional(),
});

export const staySchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1, "Enter a stay name."),
  checkInDate: z.string().min(1, "Enter a check-in date."),
  checkOutDate: z.string().min(1, "Enter a check-out date."),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  cost: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null)),
  address: z.string().optional(),
  url: z.string().optional(),
  bookingReference: z.string().optional(),
  notes: z.string().optional(),
});

export const expenseSchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1, "Enter an expense name."),
  date: z.string().min(1, "Enter an expense date."),
  cost: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null)),
  taxRefund: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null)),
});
