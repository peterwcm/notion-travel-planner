"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function SubmitButton({ children, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={cn("button", className)} disabled={pending} type="submit">
      {pending ? "Saving..." : children}
    </button>
  );
}
