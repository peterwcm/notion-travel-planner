import type { ReactElement } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { FlightPassengersField } from "@/components/flight-passengers-field";
import { FormDialog } from "@/components/form-dialog";
import { LocalDate } from "@/components/local-date-time";
import { SubmitButton } from "@/components/submit-button";
import {
  ExpenseDetailCard,
  FlightDetailCard,
  ItineraryItemCard,
  StayDetailCard,
} from "@/components/trip-detail-cards";
import {
  createDayAction,
  createExpenseAction,
  createFlightAction,
  createItemAction,
  createStayAction,
  updateTripAction,
} from "@/app/(protected)/trips/actions";
import { getNotionStatus, getTripDetail, getTripStats } from "@/lib/notion";
import type { TripDetail, TripSectionTab } from "@/lib/types";
import { currency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tabs: Array<{ id: TripSectionTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "flights", label: "Flights" },
  { id: "stays", label: "Stays" },
  { id: "expenses", label: "Expenses" },
];

const ITEM_TYPE_OPTIONS = [
  "Sightseeing",
  "Transit",
  "Stay",
  "Food",
  "Shopping",
  "Reminder",
  "Other",
] as const;

interface TripDetailPageProps {
  params: {
    id: string;
  };
  searchParams?: {
    tab?: string;
  };
}

function getTab(tab?: string): TripSectionTab {
  return tabs.some((item) => item.id === tab)
    ? (tab as TripSectionTab)
    : "overview";
}

export default async function TripDetailPage({
  params,
  searchParams,
}: TripDetailPageProps) {
  const setupStatus = getNotionStatus();
  let detail: TripDetail | null = null;
  let hasLoadError = false;

  try {
    detail = await getTripDetail(params.id);
  } catch {
    hasLoadError = true;
  }

  if (!setupStatus.configured || hasLoadError) {
    return (
      <div className="page">
        <div className="notice">
          <strong>Trip data is temporarily unavailable</strong>
          <p className="muted">Check the setup and refresh the page.</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    notFound();
  }

  const activeTab = getTab(searchParams?.tab);
  const stats = getTripStats(detail);

  return (
    <div className="page">
      <Link className="ghost-button" href="/trips">
        Back to trips
      </Link>

      <section className="hero summary-hero summary-hero--compact">
        <div className="stack summary-copy">
          <div className="header-actions">
            <div className="stack compact-headline">
              <h2>{detail.trip.destination}</h2>
              <p className="muted summary-destination">
                <LocalDate value={detail.trip.startDate} /> -{" "}
                <LocalDate value={detail.trip.endDate} />
              </p>
            </div>
            <div className="stats-inline">
              <FormDialog
                description="Update the destination, dates, and notes."
                title="Edit trip"
                triggerClassName="ghost-button"
                triggerLabel="Edit trip"
              >
                <form action={updateTripAction} className="stack">
                  <input name="tripId" type="hidden" value={detail.trip.id} />
                  <div className="forms-grid">
                    <div className="field">
                      <label
                        className="field-label field-label--required"
                        htmlFor="trip-destination"
                      >
                        Destination
                      </label>
                      <input
                        className="input"
                        defaultValue={detail.trip.destination}
                        id="trip-destination"
                        name="destination"
                        required
                      />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="trip-startDate">
                        Start date
                      </label>
                      <input
                        className="input"
                        defaultValue={toDateInputValue(detail.trip.startDate)}
                        id="trip-startDate"
                        name="startDate"
                        type="date"
                      />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="trip-endDate">
                        End date
                      </label>
                      <input
                        className="input"
                        defaultValue={toDateInputValue(detail.trip.endDate)}
                        id="trip-endDate"
                        name="endDate"
                        type="date"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="trip-notes">
                      Notes
                    </label>
                    <textarea
                      className="textarea textarea--compact"
                      defaultValue={detail.trip.notes}
                      id="trip-notes"
                      name="notes"
                      placeholder="Short summary for this trip"
                    />
                  </div>
                  <SubmitButton>Save trip</SubmitButton>
                </form>
              </FormDialog>
            </div>
          </div>

          <div className="metrics metrics--summary">
            <div className="metric">
              <span className="metric__label">Total cost</span>
              <strong>{currency(stats.totalCost)}</strong>
            </div>
            <div className="metric">
              <span className="metric__label">Total tax refund</span>
              <strong>{currency(stats.totalTaxRefund)}</strong>
            </div>
            <div className="metric">
              <span className="metric__label">Net cost</span>
              <strong>
                {currency(stats.totalCost - stats.totalTaxRefund)}
              </strong>
            </div>
          </div>

          {detail.trip.notes ? (
            <p className="summary-notes">{detail.trip.notes}</p>
          ) : null}
        </div>
      </section>

      <nav className="tab-nav" aria-label="Trip detail sections">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            className={
              tab.id === activeTab ? "tab-link tab-link--active" : "tab-link"
            }
            href={`/trips/${detail.trip.id}?tab=${tab.id}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {activeTab === "overview" ? <OverviewTab detail={detail} /> : null}
      {activeTab === "itinerary" ? <ItineraryTab detail={detail} /> : null}
      {activeTab === "flights" ? <FlightsTab detail={detail} /> : null}
      {activeTab === "stays" ? <StaysTab detail={detail} /> : null}
      {activeTab === "expenses" ? <ExpensesTab detail={detail} /> : null}
    </div>
  );
}

function OverviewTab({ detail }: { detail: TripDetail }) {
  const items = getOverviewItems(detail);

  return (
    <section className="page page--tight">
      <div className="stack">
        {items.length > 0 ? (
          items.map((item) => item.card)
        ) : (
          <div className="empty">No trip details yet.</div>
        )}
      </div>
    </section>
  );
}

function ItineraryTab({ detail }: { detail: TripDetail }) {
  return (
    <section className="page page--tight">
      <div className="header-actions">
        <h3 className="section-title">Daily itinerary</h3>
        <FormDialog
          description="Add a new day section."
          title="New day"
          triggerLabel="New day"
        >
          <form action={createDayAction} className="stack">
            <input name="tripId" type="hidden" value={detail.trip.id} />
            <div className="forms-grid">
              <div className="field">
                <label
                  className="field-label field-label--required"
                  htmlFor="day-title"
                >
                  Title
                </label>
                <input
                  className="input"
                  defaultValue={`Day ${detail.days.length + 1}`}
                  id="day-title"
                  name="title"
                  required
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="day-date">
                  Date
                </label>
                <input
                  className="input"
                  id="day-date"
                  name="date"
                  type="date"
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="day-number">
                  Day number
                </label>
                <input
                  className="input"
                  defaultValue={detail.days.length + 1}
                  id="day-number"
                  min={1}
                  name="dayNumber"
                  type="number"
                />
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="summary">
                Summary
              </label>
              <textarea
                className="textarea textarea--compact"
                id="summary"
                name="summary"
                placeholder="Short summary"
              />
            </div>
            <SubmitButton>Create day</SubmitButton>
          </form>
        </FormDialog>
      </div>

      <section className="timeline">
        {detail.days.length > 0 ? (
          detail.days.map((day) => (
            <article className="timeline-day" key={day.id}>
              <div className="header-actions">
                <div>
                  <span className="tag">Day {day.dayNumber}</span>
                  <h3 className="section-title">{day.title}</h3>
                  <p className="muted">
                    <LocalDate value={day.date} />
                    {day.summary ? ` ・${day.summary}` : ""}
                  </p>
                </div>
                <span className="pill">{day.items.length} items</span>
              </div>

              <div className="day-grid">
                <div className="item-list">
                  {day.items.length > 0 ? (
                    day.items.map((item) => (
                      <ItineraryItemCard
                        key={item.id}
                        tripId={detail.trip.id}
                        dayId={day.id}
                        item={item}
                      />
                    ))
                  ) : (
                    <div className="empty">
                      No items scheduled for this day.
                    </div>
                  )}
                </div>

                <div className="panel panel--side stack">
                  <div className="header-actions">
                    <h4>New item</h4>
                    <FormDialog
                      description="Add a new plan for this day."
                      title={`New item for ${day.title}`}
                      triggerLabel="New item"
                    >
                      <form action={createItemAction} className="stack">
                        <input
                          name="tripId"
                          type="hidden"
                          value={detail.trip.id}
                        />
                        <input name="dayId" type="hidden" value={day.id} />
                        <div className="forms-grid">
                          <div className="field">
                            <label className="field-label field-label--required">
                              Name
                            </label>
                            <input
                              className="input"
                              name="title"
                              placeholder="Walk around Senso-ji"
                              required
                            />
                          </div>
                          <div className="field">
                            <label className="field-label">Type</label>
                            <select
                              className="select"
                              defaultValue="Sightseeing"
                              name="type"
                            >
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
                              name="startTime"
                              placeholder="09:00"
                            />
                          </div>
                          <div className="field">
                            <label className="field-label">End time</label>
                            <input
                              className="input"
                              name="endTime"
                              placeholder="11:00"
                            />
                          </div>
                          <div className="field">
                            <label className="field-label">Location</label>
                            <input
                              className="input"
                              name="location"
                              placeholder="Location"
                            />
                          </div>
                          <div className="field">
                            <label className="field-label">Order</label>
                            <input
                              className="input"
                              defaultValue={day.items.length}
                              min={0}
                              name="order"
                              type="number"
                            />
                          </div>
                          <div className="field">
                            <label className="field-label">Cost</label>
                            <input
                              className="input"
                              min={0}
                              name="cost"
                              placeholder="0"
                              type="number"
                            />
                          </div>
                          <div className="field">
                            <label className="field-label">Link</label>
                            <input
                              className="input"
                              name="url"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                        <div className="field">
                          <label className="field-label">Notes</label>
                          <textarea
                            className="textarea textarea--compact"
                            name="notes"
                            placeholder="Additional details"
                          />
                        </div>
                        <SubmitButton>Create item</SubmitButton>
                      </form>
                    </FormDialog>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty">No days yet.</div>
        )}
      </section>
    </section>
  );
}

function FlightsTab({ detail }: { detail: TripDetail }) {
  return (
    <section className="section-block">
      <div className="header-actions">
        <h3 className="section-title">Flights</h3>
        <FormDialog
          description="Add an outbound or return flight."
          title="New flight"
          triggerLabel="New flight"
        >
          <form action={createFlightAction} className="stack">
            <input name="tripId" type="hidden" value={detail.trip.id} />
            <div className="forms-grid">
              <LabeledInput
                label="Airline"
                name="airline"
                placeholder="EVA Air"
                required
              />
              <LabeledInput
                label="Flight number"
                name="flightNumber"
                placeholder="BR67"
                required
              />
              <LabeledInput
                label="Departure airport"
                name="departureAirport"
                placeholder="TPE"
                required
              />
              <LabeledInput
                label="Arrival airport"
                name="arrivalAirport"
                placeholder="NRT"
                required
              />
              <LabeledInput
                label="Departure time"
                name="departureAt"
                type="datetime-local"
                required
              />
              <LabeledInput
                label="Arrival time"
                name="arrivalAt"
                type="datetime-local"
                required
              />
              <LabeledInput
                label="Aircraft"
                name="aircraft"
                placeholder="Boeing 787-10"
              />
              <LabeledInput
                label="Baggage info"
                name="baggageInfo"
                placeholder="23kg x 2 + 7kg carry-on"
              />
              <LabeledInput
                label="Cost"
                name="cost"
                type="number"
                min={0}
                placeholder="0"
              />
            </div>
            <FlightPassengersField />
            <LabeledTextarea
              label="Notes"
              name="notes"
              placeholder="Additional details"
            />
            <SubmitButton>Create flight</SubmitButton>
          </form>
        </FormDialog>
      </div>
      <section className="stack">
        {detail.flights.length > 0 ? (
          detail.flights.map((flight) => (
            <FlightDetailCard
              key={flight.id}
              tripId={detail.trip.id}
              flight={flight}
            />
          ))
        ) : (
          <div className="empty">No flights yet.</div>
        )}
      </section>
    </section>
  );
}

function StaysTab({ detail }: { detail: TripDetail }) {
  return (
    <section className="section-block">
      <div className="header-actions">
        <h3 className="section-title">Stays</h3>
        <FormDialog
          description="Add a hotel, apartment, or rental."
          title="New stay"
          triggerLabel="New stay"
        >
          <form action={createStayAction} className="stack">
            <input name="tripId" type="hidden" value={detail.trip.id} />
            <div className="forms-grid">
              <LabeledInput
                label="Stay name"
                name="title"
                placeholder="Shinjuku Granbell"
                required
              />
              <LabeledInput
                label="Check-in date"
                name="checkInDate"
                type="date"
                required
              />
              <LabeledInput
                label="Check-out date"
                name="checkOutDate"
                type="date"
                required
              />
              <LabeledInput
                label="Check-in time"
                name="checkInTime"
                type="time"
              />
              <LabeledInput
                label="Check-out time"
                name="checkOutTime"
                type="time"
              />
              <LabeledInput
                label="Cost"
                name="cost"
                type="number"
                min={0}
                placeholder="0"
              />
              <LabeledInput label="Link" name="url" placeholder="https://..." />
              <LabeledInput
                label="Booking reference"
                name="bookingReference"
                placeholder="ABCD1234"
              />
            </div>
            <LabeledTextarea
              label="Address"
              name="address"
              placeholder="Address"
            />
            <LabeledTextarea
              label="Notes"
              name="notes"
              placeholder="Additional details"
            />
            <SubmitButton>Create stay</SubmitButton>
          </form>
        </FormDialog>
      </div>
      <section className="stack">
        {detail.stays.length > 0 ? (
          detail.stays.map((stay) => (
            <StayDetailCard key={stay.id} tripId={detail.trip.id} stay={stay} />
          ))
        ) : (
          <div className="empty">No stays yet.</div>
        )}
      </section>
    </section>
  );
}

function ExpensesTab({ detail }: { detail: TripDetail }) {
  return (
    <section className="section-block">
      <div className="header-actions">
        <h3 className="section-title">Expenses</h3>
        <FormDialog
          description="Add a trip-level expense."
          title="New expense"
          triggerLabel="New expense"
        >
          <form action={createExpenseAction} className="stack">
            <input name="tripId" type="hidden" value={detail.trip.id} />
            <div className="forms-grid">
              <LabeledInput
                label="Name"
                name="title"
                placeholder="Airport transfer"
                required
              />
              <LabeledInput label="Date" name="date" type="date" required />
              <LabeledInput
                label="Cost"
                name="cost"
                type="number"
                min={0}
                placeholder="0"
              />
              <LabeledInput
                label="Tax refund"
                name="taxRefund"
                type="number"
                min={0}
                placeholder="0"
              />
            </div>
            <SubmitButton>Create expense</SubmitButton>
          </form>
        </FormDialog>
      </div>
      <section className="stack">
        {detail.expenses.length > 0 ? (
          detail.expenses.map((expense) => (
            <ExpenseDetailCard
              key={expense.id}
              tripId={detail.trip.id}
              expense={expense}
            />
          ))
        ) : (
          <div className="empty">No expenses yet.</div>
        )}
      </section>
    </section>
  );
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
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

type OverviewItem = {
  card: ReactElement;
  sortValue: number;
};

function getOverviewItems(detail: TripDetail): OverviewItem[] {
  const dayItems = detail.days.flatMap((day) =>
    day.items.map<OverviewItem>((item, index) => ({
      card: (
        <ItineraryItemCard
          key={`overview-item-${item.id}`}
          tripId={detail.trip.id}
          dayId={day.id}
          item={item}
        />
      ),
      sortValue: getDateAndTimeSortValue(day.date, item.startTime, index),
    })),
  );

  const flightItems = detail.flights.map<OverviewItem>((flight, index) => ({
    card: (
      <FlightDetailCard
        key={`overview-flight-${flight.id}`}
        tripId={detail.trip.id}
        flight={flight}
      />
    ),
    sortValue: getDateSortValue(flight.departureAt, index),
  }));

  const stayItems = detail.stays.map<OverviewItem>((stay, index) => ({
    card: (
      <StayDetailCard
        key={`overview-stay-${stay.id}`}
        tripId={detail.trip.id}
        stay={stay}
      />
    ),
    sortValue: getDateAndTimeSortValue(
      stay.checkInDate,
      stay.checkInTime,
      index,
    ),
  }));

  return [...dayItems, ...flightItems, ...stayItems].sort(
    (a, b) => a.sortValue - b.sortValue,
  );
}

function getDateSortValue(value?: string | null, index = 0) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER - 1000 + index;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp)
    ? Number.MAX_SAFE_INTEGER - 1000 + index
    : timestamp;
}

function getDateAndTimeSortValue(
  date?: string | null,
  time?: string | null,
  index = 0,
) {
  if (!date) {
    return Number.MAX_SAFE_INTEGER - 1000 + index;
  }

  const normalizedTime = normalizeTime(time) ?? "00:00";
  const timestamp = new Date(`${date}T${normalizedTime}:00Z`).getTime();
  return Number.isNaN(timestamp)
    ? Number.MAX_SAFE_INTEGER - 1000 + index
    : timestamp;
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function normalizeTime(value?: string | null) {
  if (!hasText(value)) {
    return null;
  }

  const match = value?.match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return value ?? null;
  }

  const [, hours, minutes] = match;
  return `${hours.padStart(2, "0")}:${minutes}`;
}
