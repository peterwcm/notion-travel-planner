import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/env";
import { hasValidSessionToken } from "@/lib/session";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!(await hasValidSessionToken(token))) {
    redirect("/login");
  }

  return (
    <main className="page-frame">{children}</main>
  );
}
