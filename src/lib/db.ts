import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "@/lib/resolve-database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createClient(url: string) {
  return new PrismaClient({
    datasources: {
      db: { url },
    },
    // Keep runtime resilient when some tables are not yet migrated; callers already fallback on catch.
    // Avoid noisy Prisma engine logs flooding browser/server consoles in dev.
    log: [],
  });
}

/** Prisma client when a URL can be resolved; otherwise `null` (e.g. CI build without DB). */
export function getPrisma(): PrismaClient | null {
  const url = resolveDatabaseUrl();
  if (!url) return null;

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient(url);
  }
  return globalForPrisma.prisma;
}

export function requirePrisma(): PrismaClient {
  const p = getPrisma();
  if (!p) {
    throw new Error(
      "Database not configured: set DATABASE_URL and/or DATABASE_PUBLIC_URL (see .env.example).",
    );
  }
  return p;
}

export { resolveDatabaseUrl } from "@/lib/resolve-database-url";
