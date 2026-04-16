import type { AnalyticsEventType } from "@/lib/analytics-events";
import { getPrisma } from "@/lib/db";

export type DashboardKpis = {
  callClicks: number;
  whatsappClicks: number;
  locationClicks: number;
  bookingClicks: number;
  bookingSubmissions: number;
};

export type DailyPoint = {
  day: string;
  count: number;
};

export type AnalyticsDashboardData = {
  kpis30d: DashboardKpis;
  today: DashboardKpis;
  trend30d: DailyPoint[];
  byEvent30d: { eventType: AnalyticsEventType; count: number }[];
};

const KPI_EVENT_MAP: Record<keyof DashboardKpis, AnalyticsEventType> = {
  callClicks: "CALL_CLICK",
  whatsappClicks: "WHATSAPP_CLICK",
  locationClicks: "LOCATION_CLICK",
  bookingClicks: "BOOKING_CLICK",
  bookingSubmissions: "BOOKING_SUBMITTED",
};

function zeroKpis(): DashboardKpis {
  return {
    callClicks: 0,
    whatsappClicks: 0,
    locationClicks: 0,
    bookingClicks: 0,
    bookingSubmissions: 0,
  };
}

function startOfDayLocal(d = new Date()): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export async function getAnalyticsDashboardData(): Promise<AnalyticsDashboardData> {
  const prisma = getPrisma();
  if (!prisma) {
    return {
      kpis30d: zeroKpis(),
      today: zeroKpis(),
      trend30d: [],
      byEvent30d: [],
    };
  }

  const now = new Date();
  const start30d = new Date(now);
  start30d.setDate(start30d.getDate() - 29);
  start30d.setHours(0, 0, 0, 0);
  const todayStart = startOfDayLocal(now);

  let events30d: { eventType: AnalyticsEventType; createdAt: Date }[] = [];
  let eventsToday: { eventType: AnalyticsEventType }[] = [];
  try {
    [events30d, eventsToday] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: start30d } },
        select: { eventType: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { eventType: true },
      }),
    ]);
  } catch {
    return {
      kpis30d: zeroKpis(),
      today: zeroKpis(),
      trend30d: [],
      byEvent30d: [],
    };
  }

  const kpis30d = zeroKpis();
  for (const [k, eventType] of Object.entries(KPI_EVENT_MAP) as [keyof DashboardKpis, AnalyticsEventType][]) {
    kpis30d[k] = events30d.filter((e) => e.eventType === eventType).length;
  }

  const today = zeroKpis();
  for (const [k, eventType] of Object.entries(KPI_EVENT_MAP) as [keyof DashboardKpis, AnalyticsEventType][]) {
    today[k] = eventsToday.filter((e) => e.eventType === eventType).length;
  }

  const dayBuckets = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const day = new Date(start30d);
    day.setDate(start30d.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    dayBuckets.set(key, 0);
  }
  for (const e of events30d) {
    const key = e.createdAt.toISOString().slice(0, 10);
    dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  }
  const trend30d = [...dayBuckets.entries()].map(([day, count]) => ({ day, count }));

  const byEventMap = new Map<AnalyticsEventType, number>();
  for (const e of events30d) {
    byEventMap.set(e.eventType, (byEventMap.get(e.eventType) ?? 0) + 1);
  }
  const byEvent30d = [...byEventMap.entries()]
    .map(([eventType, count]) => ({ eventType, count }))
    .sort((a, b) => b.count - a.count);

  return { kpis30d, today, trend30d, byEvent30d };
}
