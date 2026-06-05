import { AdminDbError } from "@/components/admin/AdminDbError";
import { getPrisma } from "@/lib/db";
import type { HostChatLead, TableBooking } from "@prisma/client";

export const dynamic = "force-dynamic";

function formatBookingDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) {
    return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  }
  return `+${d}`;
}

export default async function AdminBookingsPage() {
  const prisma = getPrisma();

  if (!prisma) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
        <p className="font-medium">Database not configured</p>
        <p className="mt-2 text-sm opacity-90">
          Set <code className="text-ff-glow">DATABASE_URL</code>, run{" "}
          <code className="font-mono">npm run db:push</code>, then bookings will appear here.
        </p>
      </div>
    );
  }

  let bookings: TableBooking[] = [];
  let chatLeads: HostChatLead[] = [];

  try {
    bookings = await prisma.tableBooking.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return <AdminDbError title="Could not load table bookings from the database." />;
  }

  try {
    chatLeads = await prisma.hostChatLead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  } catch {
    chatLeads = [];
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ff-glow">Bookings &amp; leads</h1>
      <p className="mt-2 text-sm text-ff-mist/75">
        Table requests from <span className="text-ff-mint/90">/book</span> and contacts captured in{" "}
        <span className="text-ff-mint/90">Chat with us</span>.
      </p>

      <section className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ff-mist/55">
          Host chat leads · {chatLeads.length}
        </p>
        <p className="mt-1 text-xs text-ff-mist/55">
          Name + mobile when a guest taps Book a table in the chat and shares their details.
        </p>
        {chatLeads.length === 0 ? (
          <p className="mt-4 text-sm text-ff-mist/60">No chat leads yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-ff-violet/20 bg-ff-deep/40">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ff-glow/15 text-xs font-semibold uppercase tracking-wider text-ff-mist/60">
                  <th className="px-4 py-3">Captured</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {chatLeads.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-ff-glow/10 text-ff-mist/90 last:border-0 hover:bg-ff-void/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-ff-mist/75">
                      {l.createdAt.toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{l.guestName}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ff-mint/85">
                      {formatPhoneDisplay(l.phone)}
                    </td>
                    <td className="px-4 py-3 text-xs text-ff-mist/70">{l.source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ff-mist/55">
          Table bookings · {bookings.length}
        </p>

        {bookings.length === 0 ? (
          <p className="mt-4 text-sm text-ff-mist/60">No table bookings yet.</p>
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
                      {formatPhoneDisplay(b.phone)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{formatBookingDate(b.date)}</td>
                    <td className="px-4 py-3 text-ff-mist/88">{b.slot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
