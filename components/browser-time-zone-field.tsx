"use client";

import { useEffect, useId, useState } from "react";

interface BrowserTimeZoneFieldProps {
  name?: string;
  label?: string;
}

const FALLBACK_TIME_ZONES = [
  "UTC",
  "Asia/Taipei",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
] as const;

export function BrowserTimeZoneField({
  name = "timeZone",
  label = "Time zone",
}: BrowserTimeZoneFieldProps) {
  const [timeZone, setTimeZone] = useState("");
  const fieldId = useId();
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setOptions(
      typeof Intl.supportedValuesOf === "function"
        ? Intl.supportedValuesOf("timeZone")
        : [...FALLBACK_TIME_ZONES],
    );
  }, []);

  return (
    <div className="field">
      <label className="field-label" htmlFor={fieldId}>
        {label}
      </label>
      <select
        className="select"
        id={fieldId}
        name={name}
        onChange={(event) => setTimeZone(event.target.value)}
        value={timeZone}
      >
        {!timeZone ? <option value="">Select a time zone</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
