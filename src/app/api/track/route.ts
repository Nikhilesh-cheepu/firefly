import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { isAnalyticsEventType } from "@/lib/analytics-events";

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 120) : null;
}

export async function POST(req: Request) {
  try {
    const json = (await req.json()) as {
      eventType?: string;
      source?: unknown;
      sessionId?: unknown;
      path?: unknown;
      meta?: unknown;
    };

    if (!json?.eventType || !isAnalyticsEventType(json.eventType)) {
      return NextResponse.json({ ok: false, error: "Invalid event type" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const source = str(json.source) ?? str(json.path);
    const sessionId = str(json.sessionId);

    await prisma.analyticsEvent.create({
      data: {
        eventType: json.eventType,
        source,
        sessionId,
        meta: json.meta && typeof json.meta === "object" ? (json.meta as Prisma.InputJsonValue) : undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true, skipped: true });
  }
}
