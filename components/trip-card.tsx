import Link from "next/link";

import type { Trip } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link className="trip-card" href={`/trips/${trip.id}`}>
      <div className="trip-card__cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {trip.cover ? <img alt={trip.title} src={trip.cover} /> : <span>{trip.destination.slice(0, 2) || "旅行"}</span>}
        <div className="trip-card__overlay">
          <span className="trip-card__destination">{trip.destination || "未設定目的地"}</span>
        </div>
      </div>
      <div className="trip-card__content">
        <div className="trip-card__header">
          <div className="stack trip-card__intro">
            <span className="trip-card__eyebrow">私人旅程檔案</span>
            <h3>{trip.title}</h3>
          </div>
          <span className="pill">{trip.status}</span>
        </div>
        <p className="trip-card__dates">
          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
        </p>
        <p className="trip-card__notes">{trip.notes || "還沒有補充備註。"} </p>
        <div className="trip-card__footer">
          <span>打開旅程</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
