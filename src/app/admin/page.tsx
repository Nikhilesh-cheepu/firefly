import Link from "next/link";
import { getAnalyticsDashboardData } from "@/lib/analytics";

function prettyLabel(eventType: string): string {
  return eventType
    .toLowerCase()
    .split("_")
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(" ");
}

export default async function AdminHomePage() {
  const analytics = await getAnalyticsDashboardData();
  const maxTrend = Math.max(1, ...analytics.trend30d.map((p) => p.count));
  const maxByEvent = Math.max(1, ...analytics.byEvent30d.map((p) => p.count));
  const bookingConversion =
    analytics.kpis30d.bookingClicks > 0
      ? Math.round((analytics.kpis30d.bookingSubmissions / analytics.kpis30d.bookingClicks) * 100)
      : 0;

  const statCards: { title: string; total: number; today: number | null; suffix?: string }[] = [
    {
      title: "Call clicks",
      total: analytics.kpis30d.callClicks,
      today: analytics.today.callClicks,
    },
    {
      title: "WhatsApp clicks",
      total: analytics.kpis30d.whatsappClicks,
      today: analytics.today.whatsappClicks,
    },
    {
      title: "Location clicks",
      total: analytics.kpis30d.locationClicks,
      today: analytics.today.locationClicks,
    },
    {
      title: "Booking clicks",
      total: analytics.kpis30d.bookingClicks,
      today: analytics.today.bookingClicks,
    },
    {
      title: "Bookings submitted",
      total: analytics.kpis30d.bookingSubmissions,
      today: analytics.today.bookingSubmissions,
    },
    {
      title: "Booking conversion",
      total: bookingConversion,
      today: null,
      suffix: "%",
    },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ff-glow md:text-4xl">
        Analytics dashboard
      </h1>
      <p className="mt-2 text-ff-mist/85">
        Mobile-first live metrics for clicks and bookings from your site (last 30 days).
      </p>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {statCards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-ff-glow/15 bg-gradient-to-b from-ff-deep/70 to-ff-void/75 p-4 ff-shadow-soft"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ff-mist/75">{card.title}</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {card.total}
              {card.suffix ?? ""}
            </p>
            {card.today !== null ? (
              <p className="mt-1 text-xs text-ff-mint/90">Today: {card.today}</p>
            ) : (
              <p className="mt-1 text-xs text-ff-mist/70">Based on clicks to submits</p>
            )}
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-ff-glow/15 bg-ff-deep/40 p-4 ff-shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Activity trend (30 days)</h2>
          <span className="text-xs text-ff-mist/75">{analytics.trend30d.length} days</span>
        </div>
        {analytics.trend30d.length === 0 ? (
          <p className="rounded-xl border border-ff-mint/20 bg-ff-void/45 px-3 py-4 text-sm text-ff-mist/80">
            No analytics yet. Once users click call/WhatsApp/location/bookings, data appears here.
          </p>
        ) : (
          <div
            className="grid h-44 items-end gap-1 overflow-hidden rounded-xl border border-ff-glow/10 bg-ff-void/35 p-2"
            style={{ gridTemplateColumns: `repeat(${Math.max(1, analytics.trend30d.length)}, minmax(0, 1fr))` }}
          >
            {analytics.trend30d.map((point) => {
              const h = Math.max(4, Math.round((point.count / maxTrend) * 100));
              return (
                <div key={point.day} className="group relative flex h-full items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-ff-glow/45 to-ff-glow"
                    style={{ height: `${h}%` }}
                    title={`${point.day}: ${point.count}`}
                  />
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-black/90 px-1.5 py-0.5 text-[10px] text-white group-hover:block">
                    {point.count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-ff-glow/15 bg-ff-deep/40 p-4 ff-shadow-soft">
        <h2 className="text-base font-semibold text-white">Event mix (30 days)</h2>
        <div className="mt-3 space-y-2">
          {analytics.byEvent30d.length === 0 ? (
            <p className="text-sm text-ff-mist/80">No events tracked yet.</p>
          ) : (
            analytics.byEvent30d.map((row) => (
              <div key={row.eventType} className="rounded-xl border border-ff-glow/10 bg-ff-void/35 p-2.5">
                <div className="mb-1 flex items-center justify-between text-xs text-ff-mist/85">
                  <span>{prettyLabel(row.eventType)}</span>
                  <span className="font-semibold text-white">{row.count}</span>
                </div>
                <div className="h-2 rounded-full bg-ff-void">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-ff-mint to-ff-glow"
                    style={{ width: `${Math.max(6, Math.round((row.count / maxByEvent) * 100))}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            href="/admin/settings"
            className="ff-card ff-card-interactive block rounded-2xl border border-ff-glow/15 bg-ff-deep/50 p-6 transition hover:border-ff-glow/30"
          >
            <h2 className="font-semibold text-white">Site settings</h2>
            <p className="mt-1 text-sm text-ff-mist/80">Sticky bar links, hero fallbacks, contact fields.</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/hero"
            className="ff-card ff-card-interactive block rounded-2xl border border-ff-glow/15 bg-ff-deep/50 p-6 transition hover:border-ff-glow/30"
          >
            <h2 className="font-semibold text-white">Hero slides</h2>
            <p className="mt-1 text-sm text-ff-mist/80">Swipeable images & videos (URLs for now).</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/gallery"
            className="ff-card ff-card-interactive block rounded-2xl border border-ff-glow/15 bg-ff-deep/50 p-6 transition hover:border-ff-glow/30"
          >
            <h2 className="font-semibold text-white">Gallery</h2>
            <p className="mt-1 text-sm text-ff-mist/80">
              Upload club photos (auto-compressed over 5MB) for the home bento grid.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/bookings"
            className="ff-card ff-card-interactive block rounded-2xl border border-ff-glow/15 bg-ff-deep/50 p-6 transition hover:border-ff-glow/30"
          >
            <h2 className="font-semibold text-white">Table bookings</h2>
            <p className="mt-1 text-sm text-ff-mist/80">
              Who booked, when, and total reservations from the /book flow.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/reviews"
            className="ff-card ff-card-interactive block rounded-2xl border border-ff-glow/15 bg-ff-deep/50 p-6 transition hover:border-ff-glow/30"
          >
            <h2 className="font-semibold text-white">Guest reviews</h2>
            <p className="mt-1 text-sm text-ff-mist/80">
              Approve or dismiss what people submit from the home page.
            </p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
