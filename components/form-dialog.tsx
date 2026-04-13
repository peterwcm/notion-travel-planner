"use client";

import type { ReactNode } from "react";
import { useId, useRef } from "react";

interface FormDialogProps {
  triggerLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormDialog({ triggerLabel, title, description, children }: FormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button className="button" onClick={() => dialogRef.current?.showModal()} type="button">
        {triggerLabel}
      </button>

      <dialog aria-labelledby={titleId} className="form-dialog" ref={dialogRef}>
        <div className="form-dialog__surface">
          <div className="header-actions form-dialog__header">
            <div className="stack compact-headline">
              <span className="tag">New</span>
              <h3 id={titleId}>{title}</h3>
              {description ? <p className="muted">{description}</p> : null}
            </div>
            <button
              aria-label="關閉"
              className="ghost-button"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              關閉
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
