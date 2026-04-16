export const ANALYTICS_EVENT_TYPES = [
  "CALL_CLICK",
  "WHATSAPP_CLICK",
  "LOCATION_CLICK",
  "BOOKING_CLICK",
  "BOOKING_SUBMITTED",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export function isAnalyticsEventType(value: string): value is AnalyticsEventType {
  return (ANALYTICS_EVENT_TYPES as readonly string[]).includes(value);
}
