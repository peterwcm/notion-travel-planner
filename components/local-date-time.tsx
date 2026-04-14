"use client";

import { useEffect, useState } from "react";

interface LocalDateProps {
  value?: string | null;
  emptyLabel?: string;
}

interface LocalDateTimeProps extends LocalDateProps {
  includeTime: boolean;
}

function isDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDateOnly(value: string) {
  const [year, month, day] = value.split("-");
  return `${year}/${month}/${day}`;
}

function formatLocalValue(value: string, includeTime: boolean) {
  if (isDateOnly(value)) {
    return formatDateOnly(value);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-TW", {
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
  emptyLabel = "未設定",
  includeTime,
}: LocalDateTimeProps) {
  const [formatted, setFormatted] = useState(() => {
    if (!value) {
      return emptyLabel;
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

    setFormatted(formatLocalValue(value, includeTime));
  }, [emptyLabel, includeTime, value]);

  return <span suppressHydrationWarning>{formatted || emptyLabel}</span>;
}

export function LocalDate(props: LocalDateProps) {
  return <LocalizedValue {...props} includeTime={false} />;
}

export function LocalDateTime(props: LocalDateProps) {
  return <LocalizedValue {...props} includeTime />;
}
