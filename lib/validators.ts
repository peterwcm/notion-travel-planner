import { z } from "zod";

export const loginSchema = z.object({
  password: z.string().min(1, "請輸入密碼"),
});

export const tripSchema = z.object({
  title: z.string().min(1, "請輸入旅程名稱"),
  destination: z.string().min(1, "請輸入目的地"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["規劃中", "已預訂", "旅行中", "已完成"]),
  cover: z.string().optional(),
  notes: z.string().optional(),
});

export const daySchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1, "請輸入每日標題"),
  date: z.string().optional(),
  dayNumber: z.coerce.number().int().positive("天次需大於 0"),
  summary: z.string().optional(),
});

export const itemSchema = z.object({
  dayId: z.string().min(1),
  title: z.string().min(1, "請輸入項目名稱"),
  type: z.enum(["景點", "交通", "住宿", "餐廳", "購物", "提醒", "其他"]),
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

export const flightSchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1, "請輸入航班標題"),
  airline: z.string().optional(),
  flightNumber: z.string().optional(),
  departureAirport: z.string().optional(),
  arrivalAirport: z.string().optional(),
  departureAt: z.string().optional(),
  arrivalAt: z.string().optional(),
  terminal: z.string().optional(),
  gate: z.string().optional(),
  notes: z.string().optional(),
});

export const staySchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1, "請輸入住宿名稱"),
  checkInDate: z.string().min(1, "請輸入住日期"),
  checkOutDate: z.string().min(1, "請輸入退房日期"),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  address: z.string().optional(),
  bookingReference: z.string().optional(),
  notes: z.string().optional(),
});

export const pickupSchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1, "請輸入接送標題"),
  pickupAt: z.string().optional(),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional(),
  provider: z.string().optional(),
  contact: z.string().optional(),
  notes: z.string().optional(),
});

export const reminderSchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1, "請輸入提醒標題"),
  remindAt: z.string().optional(),
  location: z.string().optional(),
  url: z.string().optional(),
  notes: z.string().optional(),
});
