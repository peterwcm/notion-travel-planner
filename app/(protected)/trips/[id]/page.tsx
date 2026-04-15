import type { ReactNode } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { BrowserTimeZoneField } from "@/components/browser-time-zone-field";
import { FlightPassengersField } from "@/components/flight-passengers-field";
import { FormDialog } from "@/components/form-dialog";
import { EditIcon, TrashIcon } from "@/components/icons";
import { LocalDate, LocalDateTime } from "@/components/local-date-time";
import { SubmitButton } from "@/components/submit-button";
import {
  createDayAction,
  createFlightAction,
  createItemAction,
  createStayAction,
  deleteEntityAction,
  deleteItemAction,
  updateFlightAction,
  updateItemAction,
  updateStayAction,
  updateTripAction,
} from "@/app/(protected)/trips/actions";
import { getFlightDisplayLabel } from "@/lib/flight-passengers";
import { getNotionStatus, getTripDetail, getTripStats } from "@/lib/notion";
import type {
  TripDetail,
  TripFlightPassenger,
  TripSectionTab,
} from "@/lib/types";
import { currency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tabs: Array<{ id: TripSectionTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "flights", label: "Flights" },
  { id: "stays", label: "Stays" },
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
              <h2>{detail.trip.title}</h2>
              <p className="muted summary-destination">
                {detail.trip.destination}
              </p>
            </div>
            <div className="stats-inline">
              <FormDialog
                description="Update the trip name, dates, and cover."
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
                        htmlFor="trip-title"
                      >
                        Trip name
                      </label>
                      <input
                        className="input"
                        defaultValue={detail.trip.title}
                        id="trip-title"
                        name="title"
                        required
                      />
                    </div>
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
                    <div className="field">
                      <label className="field-label" htmlFor="trip-cover">
                        Cover image URL
                      </label>
                      <input
                        className="input"
                        defaultValue={detail.trip.cover}
                        id="trip-cover"
                        name="cover"
                        placeholder="https://..."
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
              <span className="metric__label">Dates</span>
              <strong>
                <LocalDate value={detail.trip.startDate} /> -{" "}
                <LocalDate value={detail.trip.endDate} />
              </strong>
            </div>
            <div className="metric">
              <span className="metric__label">Total cost</span>
              <strong>{currency(stats.totalCost)}</strong>
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
    </div>
  );
}

function OverviewTab({ detail }: { detail: TripDetail }) {
  const items = getOverviewItems(detail);

  return (
    <section className="page page--tight">
      <div className="stack">
        {items.length > 0 ? (
          items.map((item) => (
            <StructuredCard
              key={item.id}
              label={item.label}
              title={item.title}
              meta={item.meta}
              body={item.body}
              preserveBodyNewlines={item.preserveBodyNewlines}
            >
              {item.children}
            </StructuredCard>
          ))
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
                      <div
                        className="item-card detail-card card-with-actions"
                        key={item.id}
                      >
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
                              <input
                                name="tripId"
                                type="hidden"
                                value={detail.trip.id}
                              />
                              <input
                                name="itemId"
                                type="hidden"
                                value={item.id}
                              />
                              <input
                                name="dayId"
                                type="hidden"
                                value={day.id}
                              />
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
                                  <select
                                    className="select"
                                    defaultValue={item.type}
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
                                  <label className="field-label">
                                    Start time
                                  </label>
                                  <input
                                    className="input"
                                    defaultValue={item.startTime}
                                    name="startTime"
                                    placeholder="09:00"
                                  />
                                </div>
                                <div className="field">
                                  <label className="field-label">
                                    End time
                                  </label>
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
                                  <input
                                    className="input"
                                    defaultValue={item.url}
                                    name="url"
                                  />
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
                          <DeleteForm
                            icon
                            tripId={detail.trip.id}
                            entityId={item.id}
                          />
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
                        {hasText(item.location) ||
                        typeof item.cost === "number" ? (
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
                          <a
                            className="muted"
                            href={item.url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {item.url}
                          </a>
                        ) : null}
                        {item.notes ? <p>{item.notes}</p> : null}
                      </div>
                    ))
                  ) : (
                    <div className="empty">No items scheduled for this day.</div>
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
            <BrowserTimeZoneField />
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
            <LabeledTextarea label="Notes" name="notes" placeholder="Additional details" />
            <SubmitButton>Create flight</SubmitButton>
          </form>
        </FormDialog>
      </div>
      <section className="stack">
        {detail.flights.length > 0 ? (
          detail.flights.map((flight) => (
            <div
              className="detail-card flight-card card-with-actions"
              key={flight.id}
            >
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
                    <input name="tripId" type="hidden" value={detail.trip.id} />
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
                <DeleteForm icon tripId={detail.trip.id} entityId={flight.id} />
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
                    <span className="flight-card__code">
                      {flight.departureAirport}
                    </span>
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
                    <span className="flight-card__code">
                      {flight.arrivalAirport}
                    </span>
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
              <LabeledInput label="Check-in time" name="checkInTime" type="time" />
              <LabeledInput label="Check-out time" name="checkOutTime" type="time" />
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
            <LabeledTextarea label="Address" name="address" placeholder="Address" />
            <LabeledTextarea label="Notes" name="notes" placeholder="Additional details" />
            <SubmitButton>Create stay</SubmitButton>
          </form>
        </FormDialog>
      </div>
      <section className="stack">
        {detail.stays.length > 0 ? (
          detail.stays.map((stay) => (
            <div
              className="detail-card stay-card card-with-actions"
              key={stay.id}
            >
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
                    <input name="tripId" type="hidden" value={detail.trip.id} />
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
                <DeleteForm icon tripId={detail.trip.id} entityId={stay.id} />
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
                  {hasText(stay.checkInTime) ? (
                    <small>{stay.checkInTime}</small>
                  ) : null}
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
                    <strong className="stay-card__address">
                      {stay.address}
                    </strong>
                  </div>
                ) : null}
              </div>

              {stay.url ? (
                <a
                  className="muted"
                  href={stay.url}
                  rel="noreferrer"
                  target="_blank"
                >
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
          ))
        ) : (
          <div className="empty">No stays yet.</div>
        )}
      </section>
    </section>
  );
}

function StructuredCard({
  label,
  title,
  meta,
  body,
  preserveBodyNewlines,
  actions,
  children,
}: {
  label: string;
  title: string;
  meta?: ReactNode;
  body?: ReactNode;
  preserveBodyNewlines?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={actions ? "detail-card card-with-actions" : "detail-card"}>
      {actions ? <div className="card-corner-actions">{actions}</div> : null}
      <div className="header-actions">
        <div>
          <span className="tag">{label}</span>
          <h4>{title}</h4>
        </div>
        {meta ? <span className="pill">{meta}</span> : null}
      </div>
      {body ? (
        <p
          className={
            preserveBodyNewlines
              ? "muted detail-card__body detail-card__body--multiline"
              : "muted detail-card__body"
          }
        >
          {body}
        </p>
      ) : null}
      {children}
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

type OverviewItem = {
  id: string;
  label: string;
  title: string;
  meta?: ReactNode;
  body?: ReactNode;
  preserveBodyNewlines?: boolean;
  children: ReactNode;
  sortValue: number;
};

function getOverviewItems(detail: TripDetail): OverviewItem[] {
  const dayItems = detail.days.flatMap((day) =>
    day.items.map<OverviewItem>((item, index) => ({
      id: `day-item-${item.id}`,
      label: `Day ${day.dayNumber}`,
      title: item.title,
      meta: getItemDateTimeLabel(day.date, item.startTime, item.endTime),
      body: item.notes || undefined,
      preserveBodyNewlines: Boolean(item.notes),
      children: (
        <>
          <div className="list-table">
            <div className="list-table__row">
              <span>Type</span>
              <strong>{item.type}</strong>
            </div>
            <div className="list-table__row">
              <span>Location</span>
              <strong>{item.location || "Not entered"}</strong>
            </div>
            <div className="list-table__row">
              <span>Cost</span>
              <strong>{currency(item.cost)}</strong>
            </div>
          </div>
          {item.url ? (
            <a
              className="muted"
              href={item.url}
              rel="noreferrer"
              target="_blank"
            >
              {item.url}
            </a>
          ) : null}
        </>
      ),
      sortValue: getDateAndTimeSortValue(day.date, item.startTime, index),
    })),
  );

  const flightItems = detail.flights.map<OverviewItem>((flight, index) => ({
    id: `flight-${flight.id}`,
    label: "Flight",
    title: getFlightDisplayLabel(flight),
    meta: <LocalDateTime value={flight.departureAt} />,
    body: flight.notes || undefined,
    preserveBodyNewlines: Boolean(flight.notes),
    children: (
      <div className="list-table">
        <div className="list-table__row">
          <span>Departure</span>
          <strong>
            <LocalDateTime value={flight.departureAt} />
          </strong>
        </div>
        <div className="list-table__row">
          <span>Arrival</span>
          <strong>
            <LocalDateTime value={flight.arrivalAt} />
          </strong>
        </div>
        <div className="list-table__row">
          <span>Cost</span>
          <strong>{currency(flight.cost)}</strong>
        </div>
      </div>
    ),
    sortValue: getDateSortValue(flight.departureAt, index),
  }));

  const stayItems = detail.stays.map<OverviewItem>((stay, index) => ({
    id: `stay-${stay.id}`,
    label: "Stay",
    title: stay.title,
    meta: getStayDateTimeLabel(stay),
    body: stay.notes || undefined,
    preserveBodyNewlines: Boolean(stay.notes),
    children: (
      <div className="list-table">
        <div className="list-table__row">
          <span>Check-in</span>
          <strong>
            <LocalDate value={stay.checkInDate} />
            {hasText(stay.checkInTime)
              ? ` ${normalizeTime(stay.checkInTime)}`
              : ""}
          </strong>
        </div>
        <div className="list-table__row">
          <span>Check-out</span>
          <strong>
            <LocalDate value={stay.checkOutDate} />
            {hasText(stay.checkOutTime)
              ? ` ${normalizeTime(stay.checkOutTime)}`
              : ""}
          </strong>
        </div>
        <div className="list-table__row">
          <span>Address</span>
          <strong>{stay.address || "Not entered"}</strong>
        </div>
        <div className="list-table__row">
          <span>Cost</span>
          <strong>{currency(stay.cost)}</strong>
        </div>
        {stay.url ? (
          <a className="muted" href={stay.url} rel="noreferrer" target="_blank">
            {stay.url}
          </a>
        ) : null}
      </div>
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
  const timestamp = new Date(`${date}T${normalizedTime}:00`).getTime();
  return Number.isNaN(timestamp)
    ? Number.MAX_SAFE_INTEGER - 1000 + index
    : timestamp;
}

function getItemDateTimeLabel(
  date?: string | null,
  startTime?: string | null,
  endTime?: string | null,
) {
  const timeLabel = getItemTimeLabel(
    normalizeTime(startTime) ?? undefined,
    normalizeTime(endTime) ?? undefined,
  );
  return (
    <>
      <LocalDate value={date} />
      {timeLabel ? ` ${timeLabel}` : ""}
    </>
  );
}

function getStayDateTimeLabel(stay: TripDetail["stays"][number]) {
  return (
    <>
      <LocalDate value={stay.checkInDate} />
      {hasText(stay.checkInTime) ? ` ${normalizeTime(stay.checkInTime)}` : ""}
      {" - "}
      <LocalDate value={stay.checkOutDate} />
      {hasText(stay.checkOutTime) ? ` ${normalizeTime(stay.checkOutTime)}` : ""}
    </>
  );
}

function getPassengerKey(passenger: TripFlightPassenger, index: number) {
  return `${passenger.fullName}-${passenger.bookingReference}-${passenger.ticketNumber}-${index}`;
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function getItemTimeLabel(startTime?: string, endTime?: string) {
  if (hasText(startTime) && hasText(endTime)) {
    return `${startTime} - ${endTime}`;
  }

  if (hasText(startTime)) {
    return startTime;
  }

  if (hasText(endTime)) {
    return endTime;
  }

  return "";
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
