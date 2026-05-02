"use client";

import type { ComponentPropsWithoutRef, FormEvent, ReactNode } from "react";

interface ConfirmDeleteFormProps {
  children: ReactNode;
  confirmMessage?: string;
  className?: string;
  onConfirm?: () => void;
  action?: ComponentPropsWithoutRef<"form">["action"];
}

export function ConfirmDeleteForm({
  children,
  confirmMessage = "Delete this item?",
  className,
  onConfirm,
  action,
}: ConfirmDeleteFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const ok = window.confirm(confirmMessage);

    if (!ok) {
      event.preventDefault();
      return;
    }

    onConfirm?.();
  }

  return (
    <form action={action} className={className} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
