/**
 * Railway: private `DATABASE_URL` (*.railway.internal) vs public `DATABASE_PUBLIC_URL`.
 * Vercel / local dev must use the public URL when the private host is not routable.
 */
function withRailwaySsl(url: string): string {
  if (!url) return url;
  if (!/\.rlwy\.net|railway\.internal/i.test(url)) return url;
  if (/[?&]sslmode=/i.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}sslmode=require`;
}

export function resolveDatabaseUrl(): string {
  const privateUrl = process.env.DATABASE_URL?.trim() ?? "";
  const publicUrl = process.env.DATABASE_PUBLIC_URL?.trim() ?? "";
  const onRailwayRuntime = Boolean(process.env.RAILWAY_ENVIRONMENT);

  const looksLikeInternalOnly =
    privateUrl.includes("railway.internal") || /\.internal(?::|\/)?/i.test(privateUrl);

  if (process.env.VERCEL && publicUrl) {
    return withRailwaySsl(publicUrl);
  }

  if (looksLikeInternalOnly && publicUrl && !onRailwayRuntime) {
    return withRailwaySsl(publicUrl);
  }

  if (privateUrl) {
    return withRailwaySsl(privateUrl);
  }

  return withRailwaySsl(publicUrl);
}
