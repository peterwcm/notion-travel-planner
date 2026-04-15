"use server";

import { redirect } from "next/navigation";

import { createSession, isPasswordValid } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function loginAction(_: string | undefined, formData: FormData) {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Login failed.";
  }

  const valid = await isPasswordValid(parsed.data.password);
  if (!valid) {
    return "Incorrect password. Try again.";
  }

  await createSession();
  redirect("/trips");
}
