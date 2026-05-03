"use client";

import { useEffect, useState } from "react";

interface LocalDateProps {
  value?: string | null;
  emptyLabel?: string;
}

interface LocalDateTimeProps extends LocalDateProps {
  includeTime: boolean;
  compact?: boolean;
}

function isDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDateOnly(value: string) {
  const [year, month, day] = value.split("-");
  return `${year}/${month}/${day}`;
}

function formatCompactDateOnly(value: string) {
  const [year, month, day] = value.split("-").map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day));

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const parts = formatter.formatToParts(date);
  const monthPart = parts.find((part) => part.type === "month")?.value ?? "";
  const dayPart = parts.find((part) => part.type === "day")?.value ?? "";
  const weekdayPart = parts.find((part) => part.type === "weekday")?.value ?? "";

  return `${monthPart}/${dayPart} ${weekdayPart}`.toUpperCase();
}

function formatCompactValue(value: string) {
  if (isDateOnly(value)) {
    return formatCompactDateOnly(value);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const parts = formatter.formatToParts(date);
  const monthPart = parts.find((part) => part.type === "month")?.value ?? "";
  const dayPart = parts.find((part) => part.type === "day")?.value ?? "";
  const weekdayPart = parts.find((part) => part.type === "weekday")?.value ?? "";

  return `${monthPart}/${dayPart} ${weekdayPart}`.toUpperCase();
}

function formatUtcValue(value: string, includeTime: boolean) {
  if (isDateOnly(value)) {
    return formatDateOnly(value);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime
      ? {
          hour: "2-digit" as const,
          minute: "2-digit" as const,
          hour12: false,
        }
      : {}),
  }).format(date);
}

function LocalizedValue({
  value,
  emptyLabel = "Not set",
  includeTime,
  compact = false,
}: LocalDateTimeProps) {
  const [formatted, setFormatted] = useState(() => {
    if (!value) {
      return emptyLabel;
    }

    if (compact) {
      return formatCompactValue(value);
    }

    if (isDateOnly(value)) {
      return formatDateOnly(value);
    }

    return "";
  });

  useEffect(() => {
    if (!value) {
      setFormatted(emptyLabel);
      return;
    }

    setFormatted(compact ? formatCompactValue(value) : formatUtcValue(value, includeTime));
  }, [compact, emptyLabel, includeTime, value]);

  return <span suppressHydrationWarning>{formatted || emptyLabel}</span>;
}

export function LocalDate(props: LocalDateProps) {
  return <LocalizedValue {...props} includeTime={false} />;
}

export function LocalDateTime(props: LocalDateProps) {
  return <LocalizedValue {...props} includeTime />;
}

export function CompactDate(props: LocalDateProps) {
  return <LocalizedValue {...props} includeTime={false} compact />;
}
