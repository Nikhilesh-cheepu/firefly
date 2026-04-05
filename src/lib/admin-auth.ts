import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE_NAME = "ff_admin";

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
