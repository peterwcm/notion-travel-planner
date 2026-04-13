import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/env";
import { createSessionToken } from "@/lib/session";

export async function createSession() {
  const token = await createSessionToken();

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}

export async function isPasswordValid(password: string) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    return false;
  }

  return password === expected;
}
