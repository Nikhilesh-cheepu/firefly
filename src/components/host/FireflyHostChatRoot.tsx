import { FireflyHostChat } from "@/components/host/FireflyHostChat";
import { getFireflyOffersFromBassik } from "@/lib/bassik";
import { getSiteSettings } from "@/lib/site-data";

/** Server wrapper — loads contact links + Bassik offers for the host chat. */
export async function FireflyHostChatRoot() {
  const [settings, offers] = await Promise.all([getSiteSettings(), getFireflyOffersFromBassik()]);
  return <FireflyHostChat settings={settings} offers={offers} />;
}
