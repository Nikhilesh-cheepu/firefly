import { BookTableClient } from "@/app/book/BookTableClient";
import { getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a table — Firefly",
  description: "Reserve your table. Tollywood, cocktails, your crew — tonight at Firefly.",
};

export default async function BookTablePage() {
  const settings = await getSiteSettings();

  return (
    <main className="relative z-0 min-h-[100dvh] bg-ff-hero-void font-[family-name:var(--font-manrope)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(124,245,198,0.08),transparent)]" />
      <div className="relative z-10">
        <BookTableClient whatsappRaw={settings.whatsapp} />
      </div>
    </main>
  );
}
