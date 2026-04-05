/**
 * Railway: private `DATABASE_URL` (*.railway.internal) vs public `DATABASE_PUBLIC_URL`.
 * Vercel / local dev must use the public URL when the private host is not routable.
 */
export function resolveDatabaseUrl(): string {
  const privateUrl = process.env.DATABASE_URL?.trim() ?? "";
  const publicUrl = process.env.DATABASE_PUBLIC_URL?.trim() ?? "";
  const onRailwayRuntime = Boolean(process.env.RAILWAY_ENVIRONMENT);

  const looksLikeInternalOnly =
    privateUrl.includes("railway.internal") || /\.internal(?::|\/)?/i.test(privateUrl);

  if (process.env.VERCEL && publicUrl) {
    return publicUrl;
  }

  if (looksLikeInternalOnly && publicUrl && !onRailwayRuntime) {
    return publicUrl;
  }

  if (privateUrl) {
    return privateUrl;
  }

  return publicUrl;
}
