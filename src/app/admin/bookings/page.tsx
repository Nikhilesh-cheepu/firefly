import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatBookingDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminBookingsPage() {
  const prisma = getPrisma();

  if (!prisma) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
        <p className="font-medium">Database not configured</p>
        <p className="mt-2 text-sm opacity-90">
          Set <code className="text-ff-glow">DATABASE_URL</code>, run{" "}
          <code className="font-mono">npx prisma db push</code>, then bookings will appear here.
        </p>
      </div>
    );
  }

  const bookings = await prisma.tableBooking.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ff-glow">Table bookings</h1>
      <p className="mt-2 text-sm text-ff-mist/75">
        Submissions from the public <span className="text-ff-mint/90">/book</span> page (newest first).
      </p>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-ff-mist/55">
        Total · {bookings.length}
      </p>

      {bookings.length === 0 ? (
        <p className="mt-4 text-sm text-ff-mist/60">No bookings yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-ff-glow/15 bg-ff-deep/40">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ff-glow/15 text-xs font-semibold uppercase tracking-wider text-ff-mist/60">
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Slot</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-ff-glow/10 text-ff-mist/90 last:border-0 hover:bg-ff-void/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-ff-mist/75">
                    {b.createdAt.toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{b.guestName}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ff-mint/85">
                    +{b.phone}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatBookingDate(b.date)}</td>
                  <td className="px-4 py-3 text-ff-mist/88">{b.slot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
