import { approveGuestReview, rejectGuestReview } from "@/app/admin/reviews/actions";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const prisma = getPrisma();

  if (!prisma) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
        <p className="font-medium">Database not configured</p>
        <p className="mt-2 text-sm opacity-90">
          Set <code className="text-ff-glow">DATABASE_URL</code>, run{" "}
          <code className="font-mono">npx prisma db push</code>, then guest reviews will appear here.
        </p>
      </div>
    );
  }

  const [pending, approved] = await Promise.all([
    prisma.guestReview.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.guestReview.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ff-glow">Reviews</h1>
      <p className="mt-2 text-sm text-ff-mist/75">
        New submissions appear below. Approve to show on the home page, or dismiss if it shouldn&apos;t
        go live.
      </p>

      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-ff-mist/55">
        Pending · {pending.length}
      </p>

      {pending.length === 0 ? (
        <p className="mt-4 text-sm text-ff-mist/60">No pending reviews.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {pending.map((r) => (
            <li
              key={r.id}
              className="ff-card rounded-2xl border border-ff-glow/15 bg-ff-deep/40 p-4 ring-1 ring-white/[0.03]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ff-mist/55">
                    {r.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <p className="mt-1 font-medium text-white">{r.authorName}</p>
                  <p className="mt-1 text-sm text-ff-mint">{r.rating.toFixed(1)} / 5</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={approveGuestReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-ff-glow px-3 py-2 text-sm font-semibold text-black transition hover:brightness-105"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectGuestReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-ff-mist/25 px-3 py-2 text-sm font-medium text-ff-mist transition hover:border-ff-glow/35 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ff-mist/88">&ldquo;{r.body}&rdquo;</p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-12 text-xs font-semibold uppercase tracking-[0.2em] text-ff-mist/55">
        Live on site · {approved.length} shown
      </p>
      {approved.length === 0 ? (
        <p className="mt-4 text-sm text-ff-mist/60">No approved reviews yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2 text-sm text-ff-mist/80">
          {approved.map((r) => (
            <li key={r.id} className="flex flex-wrap justify-between gap-2 border-b border-ff-glow/10 py-2 last:border-0">
              <span className="text-white/90">{r.authorName}</span>
              <span className="tabular-nums text-ff-mint/85">{r.rating.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
