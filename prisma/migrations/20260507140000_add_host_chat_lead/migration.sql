CREATE TABLE IF NOT EXISTS "HostChatLead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guestName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "source" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "HostChatLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HostChatLead_createdAt_idx" ON "HostChatLead"("createdAt");
