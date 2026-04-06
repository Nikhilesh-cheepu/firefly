import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "ff_admin";

/** True if the ff_admin cookie carries a valid admin JWT. */
export async function verifyAdminCookie(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminJwt(token);
}

/** Use at the start of admin server actions; redirects to login if not authenticated. */
export async function assertAdminSession(): Promise<void> {
  if (!(await verifyAdminCookie())) {
    redirect("/admin/login");
  }
}

export function getAdminJwtSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim();
  if (!s) {
    throw new Error("Set ADMIN_PASSWORD (and optionally ADMIN_SESSION_SECRET) for admin access.");
  }
  return s;
}

export async function signAdminJwt(): Promise<string> {
  const secret = new TextEncoder().encode(getAdminJwtSecret());
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminJwt(token: string): Promise<boolean> {
  const raw = process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim();
  if (!raw) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(raw));
    return true;
  } catch {
    return false;
  }
}
