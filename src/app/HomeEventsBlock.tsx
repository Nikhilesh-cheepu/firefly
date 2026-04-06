import { EventsSection } from "@/components/sections/EventsSection";
import { getFireflyOffersFromBassik, isBassikOffersConfigured } from "@/lib/bassik";

export async function HomeEventsBlock() {
  const bassikConfigured = isBassikOffersConfigured();
  const offers = await getFireflyOffersFromBassik();
  return <EventsSection offers={offers} bassikConfigured={bassikConfigured} />;
}
