import type { Metadata } from "next";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { TopNavigation } from "@/components/top-navigation";
import { clearSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/env";
import { hasValidSessionToken } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Planner",
  description: "Private travel planning workspace",
};

async function logoutAction() {
  "use server";

  clearSession();
  redirect("/login");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const isLoggedIn = await hasValidSessionToken(token);

  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <TopNavigation isLoggedIn={isLoggedIn} logoutAction={isLoggedIn ? logoutAction : undefined} />
          <div className="site-content">{children}</div>
        </div>
      </body>
    </html>
  );
}
