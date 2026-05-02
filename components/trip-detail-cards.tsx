import { FlightPassengersField } from "@/components/flight-passengers-field";
import { CostCurrencyFields } from "@/components/currency-fields";
import { FormDialog } from "@/components/form-dialog";
import {
  DollarIcon,
  EditIcon,
  FlightIcon,
  FoodIcon,
  LinkIcon,
  LocationIcon,
  OtherIcon,
  ReminderIcon,
  ShoppingIcon,
  SightseeingIcon,
  StayIcon,
  TransitIcon,
  TrashIcon,
} from "@/components/icons";
import { CostPopover } from "@/components/cost-popover";
import { LocalDate, LocalDateTime } from "@/components/local-date-time";
import { SubmitButton } from "@/components/submit-button";
import {
  deleteEntityAction,
  updateExpenseAction,
  updateFlightAction,
  updateItemAction,
  updateStayAction,
} from "@/app/(protected)/trips/actions";
import { getFlightDisplayLabel } from "@/lib/flight-passengers";
import { convertToBaseCurrency } from "@/lib/currency";
import type {
  ItemType,
  Trip,
  TripCurrencyRate,
  TripExpense,
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
  currencyOptions,
  currencyRates,
  tripId,
  trip,
  dayId,
  item,
}: {
  currencyOptions: string[];
  currencyRates: TripCurrencyRate[];
  tripId: string;
  trip: Trip;
  dayId: string;
  item: TripItem;
}) {
  return (
    <div className="item-card detail-card card-with-actions">
      <div className="card-corner-actions">
        <CostAction
          baseCurrency={trip.baseCurrency}
          cost={item.cost}
          currency={item.currency}
          currencyRates={currencyRates}
        />
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
                <label className="field-label field-label--required">
                  Name
                </label>
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
              <CostCurrencyFields
                costDefaultValue={item.cost ?? ""}
                currencyDefaultValue={item.currency}
                currencyOptions={currencyOptions}
              />
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
          <ItemTypeTag type={item.type} />
          <h4>{item.title}</h4>
        </div>
        {getItemTimeLabel(item.startTime, item.endTime) ? (
          <div className="item-time">
            {getItemTimeLabel(item.startTime, item.endTime)}
          </div>
        ) : null}
      </div>
      {hasText(item.location) ? (
        <div className="row item-info">
          {hasText(item.location) ? (
            <span className="muted">{item.location}</span>
          ) : (
            <span />
          )}
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
  currencyOptions,
  currencyRates,
  tripId,
  trip,
  flight,
}: {
  currencyOptions: string[];
  currencyRates: TripCurrencyRate[];
  tripId: string;
  trip: Trip;
  flight: TripFlight;
}) {
  return (
    <div className="detail-card flight-card card-with-actions">
      <div className="card-corner-actions">
        <CostAction
          baseCurrency={trip.baseCurrency}
          cost={flight.cost}
          currency={flight.currency}
          currencyRates={currencyRates}
        />
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
              <CostCurrencyFields
                costDefaultValue={flight.cost ?? ""}
                currencyDefaultValue={flight.currency}
                currencyOptions={currencyOptions}
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
          <CardTag label="Flight">
            <FlightIcon />
          </CardTag>
          <h4>
            {flight.departureAirport} → {flight.arrivalAirport}
          </h4>
        </div>

        <div className="flight-card__route">
          <div className="flight-card__stop">
            <strong>
              <LocalDateTime value={flight.departureAt} />
            </strong>
            <span>Departure</span>
          </div>
          <div className="flight-card__route-line">
            <span />
            <small>
              {flight.airline}
              {flight.flightNumber}
            </small>
          </div>
          <div className="flight-card__stop">
            <strong>
              <LocalDateTime value={flight.arrivalAt} />
            </strong>
            <span>Arrival</span>
          </div>
        </div>
      </div>

      {hasFlightDetails(flight) ? (
        <details className="flight-card__details">
          <summary>Details</summary>
          <div className="flight-card__details-body stack">
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
        </details>
      ) : null}
    </div>
  );
}

export function StayDetailCard({
  currencyOptions,
  currencyRates,
  tripId,
  trip,
  stay,
}: {
  currencyOptions: string[];
  currencyRates: TripCurrencyRate[];
  tripId: string;
  trip: Trip;
  stay: TripStay;
}) {
  return (
    <div className="detail-card stay-card card-with-actions">
      <div className="card-corner-actions">
        <CostAction
          baseCurrency={trip.baseCurrency}
          cost={stay.cost}
          currency={stay.currency}
          currencyRates={currencyRates}
        />
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
              <CostCurrencyFields
                costDefaultValue={stay.cost ?? ""}
                currencyDefaultValue={stay.currency}
                currencyOptions={currencyOptions}
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
        <CardTag label="Stay">
          <StayIcon />
        </CardTag>
        <h4>{stay.title}</h4>
      </div>

      {hasText(stay.address) || stay.url ? (
        <div className="stay-card__list">
          {hasText(stay.address) ? (
            <div className="stay-card__list-item">
              <LocationIcon />
              <span>{stay.address}</span>
            </div>
          ) : null}
          {stay.url ? (
            <a
              className="stay-card__list-item muted"
              href={stay.url}
              rel="noreferrer"
              target="_blank"
            >
              <LinkIcon />
              <span>{stay.url}</span>
            </a>
          ) : null}
        </div>
      ) : null}

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
      </div>

      {stay.notes ? (
        <div className="stay-card__notes">
          <span>Notes</span>
          <p className="muted">{stay.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

export function ExpenseDetailCard({
  currencyOptions,
  currencyRates,
  tripId,
  trip,
  expense,
}: {
  currencyOptions: string[];
  currencyRates: TripCurrencyRate[];
  tripId: string;
  trip: Trip;
  expense: TripExpense;
}) {
  return (
    <div className="detail-card expense-card card-with-actions">
      <div className="card-corner-actions">
        <FormDialog
          description="Update this expense."
          title={`Edit ${expense.title}`}
          triggerAriaLabel="Edit expense"
          triggerClassName="icon-button"
          triggerContent={<EditIcon />}
          triggerLabel="Edit"
        >
          <form action={updateExpenseAction} className="stack">
            <input name="tripId" type="hidden" value={tripId} />
            <input name="expenseId" type="hidden" value={expense.id} />
            <div className="forms-grid">
              <LabeledInput
                label="Name"
                name="title"
                defaultValue={expense.title}
                required
              />
              <LabeledInput
                label="Date"
                name="date"
                type="date"
                defaultValue={toDateInputValue(expense.date)}
                required
              />
              <CostCurrencyFields
                costDefaultValue={expense.cost ?? ""}
                currencyDefaultValue={expense.currency}
                currencyOptions={currencyOptions}
              />
              <LabeledInput
                label="Tax refund"
                name="taxRefund"
                type="number"
                min={0}
                defaultValue={expense.taxRefund ?? ""}
              />
            </div>
            <SubmitButton>Save</SubmitButton>
          </form>
        </FormDialog>
        <DeleteForm icon tripId={tripId} entityId={expense.id} />
      </div>
      <div className="expense-card__top">
        <CardTag label="Expense">
          <DollarIcon />
        </CardTag>
        <div>
          <h4>
            <LocalDate value={expense.date} />- {expense.title}
          </h4>
        </div>
      </div>
      <div className="expense-card__total">
        <strong>
          {formatExpenseEquation(
            expense.cost,
            expense.taxRefund,
            expense.currency,
            trip.baseCurrency,
            currencyRates,
          )}
        </strong>
      </div>
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

function formatCost(cost: number | null | undefined, currencyCode: string) {
  return typeof cost === "number"
    ? currency(cost, currencyCode)
    : "Not entered";
}

function formatCostWithConversion(
  cost: number | null | undefined,
  currencyCode: string,
  baseCurrency: string,
  currencyRates: TripCurrencyRate[],
) {
  if (typeof cost !== "number") {
    return "Not entered";
  }

  const formattedCost = formatCost(cost, currencyCode);
  const converted = convertToBaseCurrency(cost, currencyCode, {
    trip: { baseCurrency },
    currencyRates,
  });

  if (typeof converted.amount === "number" && currencyCode !== baseCurrency) {
    return `${formattedCost} (${currency(converted.amount, baseCurrency)})`;
  }

  if (converted.missingCurrency) {
    return `${formattedCost} (missing ${baseCurrency} rate)`;
  }

  return formattedCost;
}

function formatExpenseEquation(
  cost: number | null | undefined,
  taxRefund: number | null | undefined,
  currencyCode: string,
  baseCurrency: string,
  currencyRates: TripCurrencyRate[],
) {
  const costLabel = formatCostWithConversion(
    cost,
    currencyCode,
    baseCurrency,
    currencyRates,
  );
  const refundValue = taxRefund ?? 0;
  const netValue = (cost ?? 0) - refundValue;
  const netLabel = formatCostWithConversion(
    netValue,
    currencyCode,
    baseCurrency,
    currencyRates,
  );

  if (refundValue > 0) {
    const refundLabel = formatCostWithConversion(
      refundValue,
      currencyCode,
      baseCurrency,
      currencyRates,
    );
    return `${costLabel} - ${refundLabel} = ${netLabel}`;
  }

  return costLabel;
}

function CostAction({
  baseCurrency,
  cost,
  currency: currencyCode,
  currencyRates,
}: {
  baseCurrency: string;
  cost?: number | null;
  currency: string;
  currencyRates: TripCurrencyRate[];
}) {
  if (typeof cost !== "number") {
    return null;
  }

  const label = formatCostWithConversion(
    cost,
    currencyCode,
    baseCurrency,
    currencyRates,
  );

  return <CostPopover label={label} />;
}

function CardTag({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span aria-label={label} className="tag" title={label}>
      {children}
    </span>
  );
}

function ItemTypeTag({ type }: { type: ItemType }) {
  switch (type) {
    case "Sightseeing":
      return (
        <CardTag label={type}>
          <SightseeingIcon />
        </CardTag>
      );
    case "Transit":
      return (
        <CardTag label={type}>
          <TransitIcon />
        </CardTag>
      );
    case "Stay":
      return (
        <CardTag label={type}>
          <StayIcon />
        </CardTag>
      );
    case "Food":
      return (
        <CardTag label={type}>
          <FoodIcon />
        </CardTag>
      );
    case "Shopping":
      return (
        <CardTag label={type}>
          <ShoppingIcon />
        </CardTag>
      );
    case "Reminder":
      return (
        <CardTag label={type}>
          <ReminderIcon />
        </CardTag>
      );
    case "Other":
    default:
      return (
        <CardTag label={type}>
          <OtherIcon />
        </CardTag>
      );
  }
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

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

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

function hasFlightDetails(flight: TripFlight) {
  return (
    hasText(flight.aircraft) ||
    hasText(flight.baggageInfo) ||
    typeof flight.cost === "number" ||
    flight.passengers.length > 0 ||
    hasText(flight.notes)
  );
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
