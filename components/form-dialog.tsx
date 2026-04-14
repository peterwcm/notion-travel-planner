"use client";

import type { FormEvent, ReactNode } from "react";
import { useId, useRef } from "react";

interface FormDialogProps {
  triggerLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
  triggerClassName?: string;
}

export function FormDialog({
  triggerLabel,
  title,
  description,
  children,
  triggerClassName = "button",
}: FormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  function handleSubmit(event: FormEvent<HTMLDialogElement>) {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    dialogRef.current?.close();
  }

  return (
    <>
      <button className={triggerClassName} onClick={() => dialogRef.current?.showModal()} type="button">
        {triggerLabel}
      </button>

      <dialog aria-labelledby={titleId} className="form-dialog" onSubmit={handleSubmit} ref={dialogRef}>
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
