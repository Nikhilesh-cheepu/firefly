import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getPrisma } from "@/lib/db";
import { isAnalyticsEventType } from "@/lib/analytics-events";

/** Always dynamic — Prisma writes; avoids any static/route caching quirks. */
export const dynamic = "force-dynamic";

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 120) : null;
}

export async function POST(req: Request) {
  let parsed: {
    eventType?: string;
    source?: unknown;
    sessionId?: unknown;
    path?: unknown;
    meta?: unknown;
  };

  try {
    parsed = (await req.json()) as typeof parsed;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!parsed?.eventType || !isAnalyticsEventType(parsed.eventType)) {
    return NextResponse.json({ ok: false, error: "invalid_event_type" }, { status: 400 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    console.warn("[api/track] Skipped — no DATABASE_URL / DATABASE_PUBLIC_URL resolved");
    return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });
  }

  const source = str(parsed.source) ?? str(parsed.path);
  const sessionId = str(parsed.sessionId);

  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: parsed.eventType,
        source,
        sessionId,
        meta:
          parsed.meta && typeof parsed.meta === "object"
            ? (parsed.meta as Prisma.InputJsonValue)
            : undefined,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const code = e instanceof PrismaClientKnownRequestError ? e.code : undefined;
    const message = e instanceof Error ? e.message : String(e);
    console.error("[api/track] Persist failed:", { code, message, eventType: parsed.eventType });
    return NextResponse.json(
      {
        ok: false,
        error: "persist_failed",
        /** Helps verify missing migrations in development / browser Network tab without opening server logs */
        prismaCode: process.env.NODE_ENV === "production" ? undefined : code,
      },
      { status: 503 },
    );
  }
}
