"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, signAdminJwt } from "@/lib/admin-auth";

function passwordMatches(input: string, expected: string): boolean {
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function adminLogin(formData: FormData) {
  const password = (formData.get("password") as string) ?? "";
  const next = (formData.get("next") as string) || "/admin";
  const expected = process.env.ADMIN_PASSWORD?.trim();

  if (!expected || !passwordMatches(password, expected)) {
    redirect("/admin/login?error=1");
  }

  let token: string;
  try {
    token = await signAdminJwt();
  } catch {
    redirect("/admin/login?error=config");
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function adminLogout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
