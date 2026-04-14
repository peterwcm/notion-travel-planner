import type { TripFlightPassenger } from "@/lib/types";

export function normalizeFlightPassengers(passengers: TripFlightPassenger[]) {
  return passengers
    .map((passenger) => ({
      fullName: passenger.fullName.trim(),
      bookingReference: passenger.bookingReference.trim(),
      ticketNumber: passenger.ticketNumber.trim(),
    }))
    .filter((passenger) => passenger.fullName || passenger.bookingReference || passenger.ticketNumber);
}

export function serializeFlightPassengers(passengers: TripFlightPassenger[]) {
  return normalizeFlightPassengers(passengers)
    .map((passenger, index) =>
      [
        `乘客 ${index + 1}`,
        `姓名：${passenger.fullName}`,
        `訂位代號：${passenger.bookingReference}`,
        `機票號碼：${passenger.ticketNumber}`,
      ].join("\n"),
    )
    .join("\n\n");
}

export function parseFlightPassengers(value?: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim());
      const details = lines.filter((line) => line.includes("："));

      const getFieldValue = (label: string) =>
        details.find((line) => line.startsWith(`${label}：`))?.slice(label.length + 1).trim() ?? "";

      return {
        fullName: getFieldValue("姓名"),
        bookingReference: getFieldValue("訂位代號"),
        ticketNumber: getFieldValue("機票號碼"),
      };
    })
    .filter((passenger) => passenger.fullName || passenger.bookingReference || passenger.ticketNumber);
}

export function getFlightDisplayLabel(input: {
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
}) {
  const airline = input.airline?.trim() ?? "";
  const flightNumber = input.flightNumber?.trim() ?? "";
  const departureAirport = input.departureAirport?.trim() ?? "";
  const arrivalAirport = input.arrivalAirport?.trim() ?? "";

  if (airline && flightNumber) {
    return `${airline} ${flightNumber}`;
  }

  if (flightNumber) {
    return flightNumber;
  }

  if (departureAirport && arrivalAirport) {
    return `${departureAirport} → ${arrivalAirport}`;
  }

  if (airline) {
    return airline;
  }

  return "未命名航班";
}
