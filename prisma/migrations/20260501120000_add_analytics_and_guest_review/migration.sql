-- Idempotent DDL for Postgres: safe when core tables already exist but analytics/reviews tables are missing.

DO $$ BEGIN
  CREATE TYPE "AnalyticsEventType" AS ENUM (
    'CALL_CLICK',
    'WHATSAPP_CLICK',
    'LOCATION_CLICK',
    'BOOKING_CLICK',
    'BOOKING_SUBMITTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "GuestReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" "AnalyticsEventType" NOT NULL,
    "source" TEXT,
    "sessionId" TEXT,
    "meta" JSONB,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

CREATE INDEX IF NOT EXISTS "AnalyticsEvent_eventType_createdAt_idx" ON "AnalyticsEvent"("eventType", "createdAt");

CREATE TABLE IF NOT EXISTS "GuestReview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "GuestReviewStatus" NOT NULL DEFAULT 'PENDING',
    "rating" DOUBLE PRECISION NOT NULL,
    "body" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,

    CONSTRAINT "GuestReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GuestReview_status_idx" ON "GuestReview"("status");
