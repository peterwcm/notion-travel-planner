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
        `Passenger ${index + 1}`,
        `Name:${passenger.fullName}`,
        `Booking Reference:${passenger.bookingReference}`,
        `Ticket Number:${passenger.ticketNumber}`,
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
      const details = lines.filter((line) => line.includes(":") || line.includes("："));

      const getFieldValue = (labels: string[]) =>
        details
          .find((line) =>
            labels.some((label) => line.startsWith(`${label}:`) || line.startsWith(`${label}：`)),
          )
          ?.replace(/^[^:：]+[:：]/, "")
          .trim() ?? "";

      return {
        fullName: getFieldValue(["Name", "姓名"]),
        bookingReference: getFieldValue(["Booking Reference", "訂位代號"]),
        ticketNumber: getFieldValue(["Ticket Number", "機票號碼"]),
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

  return "Untitled flight";
}
