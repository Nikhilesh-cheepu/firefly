/**
 * Loads .env / .env.local, resolves Railway public vs private DB URL, then runs Prisma CLI.
 */
import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { resolveDatabaseUrl } from "../src/lib/resolve-database-url";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const url = resolveDatabaseUrl();
if (!url) {
  console.error(
    "No database URL resolved. Set DATABASE_URL and/or DATABASE_PUBLIC_URL (see .env.example).",
  );
  process.exit(1);
}

process.env.DATABASE_URL = url;

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: tsx scripts/prisma-runner.ts <prisma args…>\nExample: tsx scripts/prisma-runner.ts db push",
  );
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
