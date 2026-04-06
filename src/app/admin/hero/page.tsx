import { deleteHeroSlide, moveHeroSlide } from "@/app/admin/hero/actions";
import { HeroSlideAddForm } from "@/components/admin/HeroSlideAddForm";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const prisma = getPrisma();

  if (!prisma) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
        <p className="font-medium">Database not configured</p>
        <p className="mt-2 text-sm opacity-90">
          Set <code className="text-ff-glow">DATABASE_URL</code> and/or{" "}
          <code className="text-ff-glow">DATABASE_PUBLIC_URL</code>, then{" "}
          <code className="font-mono">npm run db:push</code>.
        </p>
      </div>
    );
  }

  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ff-glow">Hero</h1>
      <p className="mt-2 text-sm text-ff-mist/75">
        Upload shows on the home hero right away. Use the <span className="text-ff-mint">speaker</span> control there
        to hear video audio.
      </p>

      <section className="mt-8 ff-card rounded-2xl border border-ff-glow/15 bg-ff-deep/40 p-6">
        <HeroSlideAddForm />
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ff-mist/55">
          Uploaded · {slides.length}
        </h2>
        {slides.length === 0 ? (
          <p className="mt-4 text-sm text-ff-mist/60">Nothing here yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {slides.map((s, idx) => (
              <li
                key={s.id}
                className="ff-card flex items-center gap-4 rounded-xl border border-ff-glow/12 bg-ff-void/50 p-3"
              >
                <div className="relative h-28 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-ff-deep ring-1 ring-ff-glow/15">
                  {s.type === "IMAGE" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.mediaUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <video
                      src={s.mediaUrl}
                      poster={s.posterUrl ?? undefined}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-1 left-1 rounded bg-[#03080f]/85 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ff-mint">
                    {s.type === "VIDEO" ? "Video" : "Image"}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:justify-end">
                  <form action={moveHeroSlide}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={idx === 0}
                      className="min-h-[44px] min-w-[44px] rounded-lg border border-ff-mint/20 text-ff-mist transition hover:border-ff-glow/35 hover:text-white disabled:opacity-25"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveHeroSlide}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={idx === slides.length - 1}
                      className="min-h-[44px] min-w-[44px] rounded-lg border border-ff-mint/20 text-ff-mist transition hover:border-ff-glow/35 hover:text-white disabled:opacity-25"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </form>
                  <form action={deleteHeroSlide}>
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      className="min-h-[44px] rounded-lg border border-red-500/30 px-4 text-sm text-red-300 transition hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
