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
  type: z.enum(["景點", "交通", "住宿", "餐廳", "購物", "其他"]),
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
  airline: z.string().min(1, "請輸入航空公司"),
  flightNumber: z.string().min(1, "請輸入航班號碼"),
  departureAirport: z.string().min(1, "請輸入出發機場"),
  arrivalAirport: z.string().min(1, "請輸入抵達機場"),
  departureAt: z.string().min(1, "請輸入出發時間"),
  arrivalAt: z.string().min(1, "請輸入抵達時間"),
  aircraft: z.string().optional(),
  baggageInfo: z.string().optional(),
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
  title: z.string().min(1, "請輸入住宿名稱"),
  checkInDate: z.string().min(1, "請輸入住日期"),
  checkOutDate: z.string().min(1, "請輸入退房日期"),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  address: z.string().optional(),
  bookingReference: z.string().optional(),
  notes: z.string().optional(),
});
