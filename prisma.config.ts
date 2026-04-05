/**
 * Railway + Vercel database URL resolution (same rules as runtime).
 *
 * Prisma 5 does **not** load this file for the datasource URL — the schema still uses
 * `env("DATABASE_URL")`. Run CLI via `npm run db:*` so `scripts/prisma-runner.ts` injects
 * the resolved URL into `process.env.DATABASE_URL` before invoking Prisma.
 */
import { resolveDatabaseUrl } from "./src/lib/resolve-database-url";

export { resolveDatabaseUrl };

export function getDatabaseUrlForPrismaCli(): string {
  return resolveDatabaseUrl();
}
