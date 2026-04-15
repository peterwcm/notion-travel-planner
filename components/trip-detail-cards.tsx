import { BrowserTimeZoneField } from "@/components/browser-time-zone-field";
import { FlightPassengersField } from "@/components/flight-passengers-field";
import { FormDialog } from "@/components/form-dialog";
import { EditIcon, TrashIcon } from "@/components/icons";
import { LocalDate, LocalDateTime } from "@/components/local-date-time";
import { SubmitButton } from "@/components/submit-button";
import {
  deleteEntityAction,
  updateFlightAction,
  updateItemAction,
  updateStayAction,
} from "@/app/(protected)/trips/actions";
import { getFlightDisplayLabel } from "@/lib/flight-passengers";
import type {
  ItemType,
  TripFlight,
  TripFlightPassenger,
  TripItem,
  TripStay,
} from "@/lib/types";
import { currency } from "@/lib/utils";

const ITEM_TYPE_OPTIONS: ItemType[] = [
  "Sightseeing",
  "Transit",
  "Stay",
  "Food",
  "Shopping",
  "Reminder",
  "Other",
];

export function ItineraryItemCard({
  tripId,
  dayId,
  item,
}: {
  tripId: string;
  dayId: string;
  item: TripItem;
}) {
  return (
    <div className="item-card detail-card card-with-actions">
      <div className="card-corner-actions">
        <FormDialog
          description="Update this itinerary item."
          title={`Edit ${item.title}`}
          triggerAriaLabel="Edit item"
          triggerClassName="icon-button"
          triggerContent={<EditIcon />}
          triggerLabel="Edit"
        >
          <form action={updateItemAction} className="stack">
            <input name="tripId" type="hidden" value={tripId} />
            <input name="itemId" type="hidden" value={item.id} />
            <input name="dayId" type="hidden" value={dayId} />
            <div className="forms-grid">
              <div className="field">
                <label className="field-label field-label--required">Name</label>
                <input
                  className="input"
                  defaultValue={item.title}
                  name="title"
                  required
                />
              </div>
              <div className="field">
                <label className="field-label">Type</label>
                <select className="select" defaultValue={item.type} name="type">
                  {ITEM_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Start time</label>
                <input
                  className="input"
                  defaultValue={item.startTime}
                  name="startTime"
                  placeholder="09:00"
                />
              </div>
              <div className="field">
                <label className="field-label">End time</label>
                <input
                  className="input"
                  defaultValue={item.endTime}
                  name="endTime"
                  placeholder="11:00"
                />
              </div>
              <div className="field">
                <label className="field-label">Location</label>
                <input
                  className="input"
                  defaultValue={item.location}
                  name="location"
                />
              </div>
              <div className="field">
                <label className="field-label">Order</label>
                <input
                  className="input"
                  defaultValue={item.order}
                  min={0}
                  name="order"
                  type="number"
                />
              </div>
              <div className="field">
                <label className="field-label">Cost</label>
                <input
                  className="input"
                  defaultValue={item.cost ?? ""}
                  min={0}
                  name="cost"
                  type="number"
                />
              </div>
              <div className="field">
                <label className="field-label">Link</label>
                <input className="input" defaultValue={item.url} name="url" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Notes</label>
              <textarea
                className="textarea textarea--compact"
                defaultValue={item.notes}
                name="notes"
              />
            </div>
            <SubmitButton>Save</SubmitButton>
          </form>
        </FormDialog>
        <DeleteForm icon tripId={tripId} entityId={item.id} />
      </div>
      <div className="item-meta">
        <div className="stack item-meta__title">
          <span className="tag">{item.type}</span>
          <h4>{item.title}</h4>
        </div>
        {getItemTimeLabel(item.startTime, item.endTime) ? (
          <div className="item-time">
            {getItemTimeLabel(item.startTime, item.endTime)}
          </div>
        ) : null}
      </div>
      {hasText(item.location) || typeof item.cost === "number" ? (
        <div className="row item-info">
          {hasText(item.location) ? (
            <span className="muted">{item.location}</span>
          ) : (
            <span />
          )}
          {typeof item.cost === "number" ? (
            <span>{currency(item.cost)}</span>
          ) : null}
        </div>
      ) : null}
      {item.url ? (
        <a className="muted" href={item.url} rel="noreferrer" target="_blank">
          {item.url}
        </a>
      ) : null}
      {item.notes ? <p>{item.notes}</p> : null}
    </div>
  );
}

export function FlightDetailCard({
  tripId,
  flight,
}: {
  tripId: string;
  flight: TripFlight;
}) {
  return (
    <div className="detail-card flight-card card-with-actions">
      <div className="card-corner-actions">
        <FormDialog
          description="Update the flight schedule and details."
          title={`Edit ${getFlightDisplayLabel(flight)}`}
          triggerAriaLabel="Edit flight"
          triggerClassName="icon-button"
          triggerContent={<EditIcon />}
          triggerLabel="Edit"
        >
          <form action={updateFlightAction} className="stack">
            <input name="tripId" type="hidden" value={tripId} />
            <input name="flightId" type="hidden" value={flight.id} />
            <BrowserTimeZoneField />
            <div className="forms-grid">
              <LabeledInput
                label="Airline"
                name="airline"
                defaultValue={flight.airline}
                required
              />
              <LabeledInput
                label="Flight number"
                name="flightNumber"
                defaultValue={flight.flightNumber}
                required
              />
              <LabeledInput
                label="Departure airport"
                name="departureAirport"
                defaultValue={flight.departureAirport}
                required
              />
              <LabeledInput
                label="Arrival airport"
                name="arrivalAirport"
                defaultValue={flight.arrivalAirport}
                required
              />
              <LabeledInput
                label="Departure time"
                name="departureAt"
                type="datetime-local"
                defaultValue={toDateTimeInputValue(flight.departureAt)}
                required
              />
              <LabeledInput
                label="Arrival time"
                name="arrivalAt"
                type="datetime-local"
                defaultValue={toDateTimeInputValue(flight.arrivalAt)}
                required
              />
              <LabeledInput
                label="Aircraft"
                name="aircraft"
                defaultValue={flight.aircraft}
              />
              <LabeledInput
                label="Baggage info"
                name="baggageInfo"
                defaultValue={flight.baggageInfo}
              />
              <LabeledInput
                label="Cost"
                name="cost"
                type="number"
                min={0}
                defaultValue={flight.cost ?? ""}
              />
            </div>
            <FlightPassengersField defaultValue={flight.passengers} />
            <LabeledTextarea
              label="Notes"
              name="notes"
              defaultValue={flight.notes}
            />
            <SubmitButton>Save</SubmitButton>
          </form>
        </FormDialog>
        <DeleteForm icon tripId={tripId} entityId={flight.id} />
      </div>
      <div className="flight-card__top">
        <div className="flight-card__headline">
          <div>
            <span className="tag">Flight</span>
            <h4>{getFlightDisplayLabel(flight)}</h4>
          </div>
          <span className="pill">{flight.airline}</span>
        </div>

        <div className="flight-card__route">
          <div className="flight-card__stop">
            <span className="flight-card__code">{flight.departureAirport}</span>
            <strong>
              <LocalDateTime value={flight.departureAt} />
            </strong>
            <span>Departure</span>
          </div>
          <div className="flight-card__route-line">
            <span />
            <small>{flight.flightNumber}</small>
          </div>
          <div className="flight-card__stop">
            <span className="flight-card__code">{flight.arrivalAirport}</span>
            <strong>
              <LocalDateTime value={flight.arrivalAt} />
            </strong>
            <span>Arrival</span>
          </div>
        </div>

        <div className="flight-card__facts">
          {hasText(flight.aircraft) ? (
            <div className="flight-card__fact">
              <span>Aircraft</span>
              <strong>{flight.aircraft}</strong>
            </div>
          ) : null}
          {hasText(flight.baggageInfo) ? (
            <div className="flight-card__fact">
              <span>Baggage info</span>
              <strong>{flight.baggageInfo}</strong>
            </div>
          ) : null}
          {typeof flight.cost === "number" ? (
            <div className="flight-card__fact">
              <span>Cost</span>
              <strong>{currency(flight.cost)}</strong>
            </div>
          ) : null}
        </div>
      </div>

      {flight.passengers.length > 0 ? (
        <div className="stack compact-list flight-card__passengers">
          {flight.passengers.map((passenger, index) => (
            <div
              className="flight-passenger-card"
              key={getPassengerKey(passenger, index)}
            >
              <div className="header-actions">
                <span className="tag">Passenger {index + 1}</span>
                {hasText(passenger.fullName) ? (
                  <strong>{passenger.fullName}</strong>
                ) : null}
              </div>
              <div className="flight-passenger-card__grid">
                {hasText(passenger.bookingReference) ? (
                  <div>
                    <span>Booking reference</span>
                    <strong>{passenger.bookingReference}</strong>
                  </div>
                ) : null}
                {hasText(passenger.ticketNumber) ? (
                  <div>
                    <span>Ticket number</span>
                    <strong>{passenger.ticketNumber}</strong>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {flight.notes ? (
        <div className="flight-card__notes">
          <span>Notes</span>
          <p className="muted">{flight.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

export function StayDetailCard({
  tripId,
  stay,
}: {
  tripId: string;
  stay: TripStay;
}) {
  return (
    <div className="detail-card stay-card card-with-actions">
      <div className="card-corner-actions">
        <FormDialog
          description="Update stay dates and details."
          title={`Edit ${stay.title}`}
          triggerAriaLabel="Edit stay"
          triggerClassName="icon-button"
          triggerContent={<EditIcon />}
          triggerLabel="Edit"
        >
          <form action={updateStayAction} className="stack">
            <input name="tripId" type="hidden" value={tripId} />
            <input name="stayId" type="hidden" value={stay.id} />
            <div className="forms-grid">
              <LabeledInput
                label="Stay name"
                name="title"
                defaultValue={stay.title}
                required
              />
              <LabeledInput
                label="Check-in date"
                name="checkInDate"
                type="date"
                defaultValue={toDateInputValue(stay.checkInDate)}
                required
              />
              <LabeledInput
                label="Check-out date"
                name="checkOutDate"
                type="date"
                defaultValue={toDateInputValue(stay.checkOutDate)}
                required
              />
              <LabeledInput
                label="Check-in time"
                name="checkInTime"
                type="time"
                defaultValue={stay.checkInTime}
              />
              <LabeledInput
                label="Check-out time"
                name="checkOutTime"
                type="time"
                defaultValue={stay.checkOutTime}
              />
              <LabeledInput
                label="Cost"
                name="cost"
                type="number"
                min={0}
                defaultValue={stay.cost ?? ""}
              />
              <LabeledInput
                label="Link"
                name="url"
                defaultValue={stay.url}
                placeholder="https://..."
              />
              <LabeledInput
                label="Booking reference"
                name="bookingReference"
                defaultValue={stay.bookingReference}
              />
            </div>
            <LabeledTextarea
              label="Address"
              name="address"
              defaultValue={stay.address}
            />
            <LabeledTextarea
              label="Notes"
              name="notes"
              defaultValue={stay.notes}
            />
            <SubmitButton>Save</SubmitButton>
          </form>
        </FormDialog>
        <DeleteForm icon tripId={tripId} entityId={stay.id} />
      </div>
      <div className="stay-card__top">
        <div>
          <span className="tag">Stay</span>
          <h4>{stay.title}</h4>
        </div>
        <span className="pill">
          <LocalDate value={stay.checkInDate} /> -{" "}
          <LocalDate value={stay.checkOutDate} />
        </span>
      </div>

      <div className="stay-card__timeline">
        <div className="stay-card__point">
          <span>Check-in</span>
          <strong>
            <LocalDate value={stay.checkInDate} />
          </strong>
          {hasText(stay.checkInTime) ? <small>{stay.checkInTime}</small> : null}
        </div>
        <div className="stay-card__line" />
        <div className="stay-card__point">
          <span>Check-out</span>
          <strong>
            <LocalDate value={stay.checkOutDate} />
          </strong>
          {hasText(stay.checkOutTime) ? (
            <small>{stay.checkOutTime}</small>
          ) : null}
        </div>
      </div>

      <div className="stay-card__facts">
        {hasText(stay.bookingReference) ? (
          <div className="stay-card__fact">
            <span>Booking reference</span>
            <strong>{stay.bookingReference}</strong>
          </div>
        ) : null}
        {typeof stay.cost === "number" ? (
          <div className="stay-card__fact">
            <span>Cost</span>
            <strong>{currency(stay.cost)}</strong>
          </div>
        ) : null}
        {hasText(stay.address) ? (
          <div className="stay-card__fact stay-card__fact--wide">
            <span>Address</span>
            <strong className="stay-card__address">{stay.address}</strong>
          </div>
        ) : null}
      </div>

      {stay.url ? (
        <a className="muted" href={stay.url} rel="noreferrer" target="_blank">
          {stay.url}
        </a>
      ) : null}

      {stay.notes ? (
        <div className="stay-card__notes">
          <span>Notes</span>
          <p className="muted">{stay.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

function DeleteForm({
  tripId,
  entityId,
  icon,
}: {
  tripId: string;
  entityId: string;
  icon?: boolean;
}) {
  return (
    <form action={deleteEntityAction}>
      <input name="tripId" type="hidden" value={tripId} />
      <input name="entityId" type="hidden" value={entityId} />
      <button
        aria-label="Delete"
        className={icon ? "icon-button icon-button--danger" : "ghost-button"}
        type="submit"
      >
        {icon ? <TrashIcon /> : "Delete"}
      </button>
    </form>
  );
}

function LabeledInput({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | number;
  required?: boolean;
  min?: number;
}) {
  return (
    <div className="field">
      <label
        className={
          required ? "field-label field-label--required" : "field-label"
        }
      >
        {label}
      </label>
      <input
        className="input"
        defaultValue={defaultValue}
        min={min}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </div>
  );
}

function LabeledTextarea({
  label,
  name,
  placeholder,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="field">
      <label
        className={
          required ? "field-label field-label--required" : "field-label"
        }
      >
        {label}
      </label>
      <textarea
        className="textarea textarea--compact"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function toDateTimeInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function getPassengerKey(passenger: TripFlightPassenger, index: number) {
  return [
    passenger.fullName,
    passenger.bookingReference,
    passenger.ticketNumber,
    index,
  ].join(":");
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function getItemTimeLabel(startTime?: string, endTime?: string) {
  const start = normalizeTime(startTime);
  const end = normalizeTime(endTime);

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end;
}

function normalizeTime(value?: string | null) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return "";
  }

  return trimmed;
}
