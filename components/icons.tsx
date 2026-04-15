import type { SVGProps } from "react";

function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width="16"
      {...props}
    />
  );
}

export function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4z" />
    </IconBase>
  );
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </IconBase>
  );
}

export function FlightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M2 16l20-5-20-5 5 5v3z" />
      <path d="M7 11l-2-5" />
      <path d="M7 13l-2 5" />
    </IconBase>
  );
}

export function StayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 18v-8" />
      <path d="M3 14h18" />
      <path d="M7 10V7a2 2 0 0 1 2-2h3a3 3 0 0 1 3 3v6" />
      <path d="M21 18v-4a2 2 0 0 0-2-2h-4" />
    </IconBase>
  );
}

export function SightseeingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 21s-5-4.35-5-9a5 5 0 1 1 10 0c0 4.65-5 9-5 9z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </IconBase>
  );
}

export function TransitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M8 18V6l8-2v12" />
      <path d="M6 18h12" />
      <path d="M8 9h8" />
      <path d="M10 18l-1 3" />
      <path d="M14 18l1 3" />
    </IconBase>
  );
}

export function FoodIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M6 3v8" />
      <path d="M9 3v8" />
      <path d="M6 7h3" />
      <path d="M7.5 11v10" />
      <path d="M16 3c1.66 0 3 1.34 3 3v15" />
      <path d="M16 3v18" />
    </IconBase>
  );
}

export function ShoppingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M6 8l1 11h10l1-11" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="M4 8h16" />
    </IconBase>
  );
}

export function ReminderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 6v6l4 2" />
      <path d="M21 12a9 9 0 1 1-9-9" />
    </IconBase>
  );
}

export function OtherIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </IconBase>
  );
}

export function LocationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </IconBase>
  );
}

export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13" />
      <path d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 0 1-7-7L7 11" />
    </IconBase>
  );
}
