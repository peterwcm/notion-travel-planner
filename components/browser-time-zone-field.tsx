"use client";

import { useEffect, useState } from "react";

interface BrowserTimeZoneFieldProps {
  name?: string;
}

export function BrowserTimeZoneField({
  name = "timeZone",
}: BrowserTimeZoneFieldProps) {
  const [timeZone, setTimeZone] = useState("");

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return <input name={name} readOnly type="hidden" value={timeZone} />;
}
