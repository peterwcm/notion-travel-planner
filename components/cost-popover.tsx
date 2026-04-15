"use client";

import { useEffect, useRef, useState } from "react";

import { DollarIcon } from "@/components/icons";

export function CostPopover({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="cost-popover" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-label={`Show cost ${label}`}
        className="icon-button icon-button--popover"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <DollarIcon />
      </button>
      {open ? (
        <div className="cost-popover__content" role="tooltip">
          {label}
        </div>
      ) : null}
    </div>
  );
}
