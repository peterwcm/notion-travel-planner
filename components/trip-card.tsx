import Link from "next/link";

import { LocalDate } from "@/components/local-date-time";
import type { Trip } from "@/lib/types";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link className="trip-card" href={`/trips/${trip.id}`}>
      <div className="trip-card__content">
        <div className="trip-card__header">
          <div className="stack trip-card__intro">
            <h3>{trip.destination}</h3>
          </div>
        </div>
        <p className="trip-card__dates">
          <LocalDate value={trip.startDate} /> -{" "}
          <LocalDate value={trip.endDate} />
        </p>
        {trip.notes ? <p className="trip-card__notes">{trip.notes}</p> : null}
        <div className="trip-card__footer">
          <span>View</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
