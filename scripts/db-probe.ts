import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "../src/lib/resolve-database-url";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = resolveDatabaseUrl();
  if (!url) {
    console.error("No database URL resolved. Set DATABASE_URL / DATABASE_PUBLIC_URL.");
    process.exit(1);
  }

  const hostMatch = url.match(/@([^:/]+):(\d+)/);
  console.log("host:", hostMatch?.[1] ?? "unknown", "port:", hostMatch?.[2] ?? "unknown");

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await prisma.$connect();
    console.log("connected: OK");

    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename
    `;
    console.log("tables:", tables.map((r) => r.tablename).join(", ") || "(none)");
  } catch (e) {
    console.error("error:", e instanceof Error ? e.message : e);
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

void main();
