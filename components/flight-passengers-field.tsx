"use client";

import { useId, useState } from "react";

import type { TripFlightPassenger } from "@/lib/types";

interface FlightPassengersFieldProps {
  defaultValue?: TripFlightPassenger[];
  name?: string;
}

function createPassenger(): TripFlightPassenger {
  return {
    fullName: "",
    bookingReference: "",
    ticketNumber: "",
  };
}

export function FlightPassengersField({
  defaultValue = [createPassenger()],
  name = "passengers",
}: FlightPassengersFieldProps) {
  const [passengers, setPassengers] = useState<TripFlightPassenger[]>(
    defaultValue.length > 0 ? defaultValue : [createPassenger()],
  );
  const fieldId = useId();

  function updatePassenger(index: number, key: keyof TripFlightPassenger, value: string) {
    setPassengers((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [key]: value } : passenger,
      ),
    );
  }

  function addPassenger() {
    setPassengers((current) => [...current, createPassenger()]);
  }

  function removePassenger(index: number) {
    setPassengers((current) => (current.length > 1 ? current.filter((_, passengerIndex) => passengerIndex !== index) : current));
  }

  return (
    <div className="field">
      <div className="header-actions">
        <label className="field-label" htmlFor={`${fieldId}-0-fullName`}>
          Passengers
        </label>
        <button className="ghost-button" onClick={addPassenger} type="button">
          Add passenger
        </button>
      </div>

      <input name={name} readOnly type="hidden" value={JSON.stringify(passengers)} />

      <div className="stack">
        {passengers.map((passenger, index) => (
          <div className="detail-card detail-card--compact" key={`${fieldId}-${index}`}>
            <div className="header-actions">
              <strong>Passenger {index + 1}</strong>
              {passengers.length > 1 ? (
                <button className="ghost-button" onClick={() => removePassenger(index)} type="button">
                  Remove
                </button>
              ) : null}
            </div>

            <div className="forms-grid">
              <div className="field">
                <label className="field-label" htmlFor={`${fieldId}-${index}-fullName`}>Name</label>
                <input
                  className="input"
                  id={`${fieldId}-${index}-fullName`}
                  onChange={(event) => updatePassenger(index, "fullName", event.target.value)}
                  value={passenger.fullName}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor={`${fieldId}-${index}-bookingReference`}>Booking reference</label>
                <input
                  className="input"
                  id={`${fieldId}-${index}-bookingReference`}
                  onChange={(event) => updatePassenger(index, "bookingReference", event.target.value)}
                  value={passenger.bookingReference}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor={`${fieldId}-${index}-ticketNumber`}>Ticket number</label>
                <input
                  className="input"
                  id={`${fieldId}-${index}-ticketNumber`}
                  onChange={(event) => updatePassenger(index, "ticketNumber", event.target.value)}
                  value={passenger.ticketNumber}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
