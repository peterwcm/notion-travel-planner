import { TripCard } from "@/components/trip-card";
import { FormDialog } from "@/components/form-dialog";
import { SubmitButton } from "@/components/submit-button";
import { createTripAction } from "@/app/(protected)/trips/actions";
import { getNotionStatus, listTrips } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const setupStatus = getNotionStatus();
  let trips = [] as Awaited<ReturnType<typeof listTrips>>;
  let hasLoadError = false;

  try {
    trips = await listTrips();
  } catch {
    hasLoadError = true;
  }

  return (
    <div className="page">
      {!setupStatus.configured || hasLoadError ? (
        <div className="notice">
          <strong>Trip data is temporarily unavailable</strong>
          <p className="muted">Check the setup and refresh the page.</p>
        </div>
      ) : null}

      <section className="section-block">
        <div className="header-actions">
          <h3 className="section-title">
            All trips
            <div className="stats-inline">
              <span>
                {trips.length} trip{trips.length !== 1 ? "s" : ""}
              </span>
            </div>
          </h3>
          <FormDialog
            description="Create a new trip card."
            title="New trip"
            triggerLabel="New trip"
          >
            <form action={createTripAction} className="stack">
              <div className="forms-grid">
                <div className="field">
                  <label
                    className="field-label field-label--required"
                    htmlFor="destination"
                  >
                    Destination
                  </label>
                  <input
                    className="input"
                    id="destination"
                    name="destination"
                    placeholder="Tokyo, Japan"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="startDate">Start date</label>
                  <input
                    className="input"
                    id="startDate"
                    name="startDate"
                    type="date"
                  />
                </div>
                <div className="field">
                  <label htmlFor="endDate">End date</label>
                  <input
                    className="input"
                    id="endDate"
                    name="endDate"
                    type="date"
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  className="textarea textarea--compact"
                  id="notes"
                  name="notes"
                  placeholder="Short summary for this trip"
                />
              </div>
              <SubmitButton>Create trip</SubmitButton>
            </form>
          </FormDialog>
        </div>
        {trips.length > 0 ? (
          <div className="trip-grid">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="empty">No trips yet.</div>
        )}
      </section>
    </div>
  );
}
