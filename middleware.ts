import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/env";
import { hasValidSessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const loggedIn = await hasValidSessionToken(token);
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  if (!loggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (loggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/trips", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
