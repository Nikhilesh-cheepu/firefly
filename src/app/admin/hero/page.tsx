import {
  createHeroSlide,
  deleteHeroSlide,
  moveHeroSlide,
  toggleHeroSlideActive,
} from "@/app/admin/hero/actions";
import { getPrisma } from "@/lib/db";

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
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ff-glow">Hero slides</h1>
      <p className="mt-2 text-sm text-ff-mist/80">
        Full-screen carousel on the home page. Use direct URLs (Blob, CDN, etc.). Vercel Blob upload
        can plug in later.
      </p>

      <section className="mt-10 ff-card rounded-2xl border border-ff-glow/15 bg-ff-deep/40 p-6">
        <h2 className="text-lg font-semibold text-white">Add slide</h2>
        <form action={createHeroSlide} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-ff-mist sm:col-span-2">
            <span className="font-medium text-white">Type</span>
            <select
              name="type"
              className="mt-2 w-full min-h-[44px] rounded-xl border border-ff-glow/20 bg-ff-void/80 px-4 text-white"
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
          </label>
          <label className="block text-sm text-ff-mist sm:col-span-2">
            <span className="font-medium text-white">Media URL *</span>
            <input
              name="mediaUrl"
              required
              placeholder="https://…"
              className="mt-2 w-full min-h-[44px] rounded-xl border border-ff-glow/20 bg-ff-void/80 px-4 text-white"
            />
          </label>
          <label className="block text-sm text-ff-mist sm:col-span-2">
            <span className="font-medium text-white">Poster URL (video)</span>
            <input
              name="posterUrl"
              placeholder="https://…"
              className="mt-2 w-full min-h-[44px] rounded-xl border border-ff-glow/20 bg-ff-void/80 px-4 text-white"
            />
          </label>
          <label className="block text-sm text-ff-mist">
            <span className="font-medium text-white">Title</span>
            <input
              name="title"
              className="mt-2 w-full min-h-[44px] rounded-xl border border-ff-glow/20 bg-ff-void/80 px-4 text-white"
            />
          </label>
          <label className="block text-sm text-ff-mist">
            <span className="font-medium text-white">CTA label</span>
            <input
              name="ctaLabel"
              className="mt-2 w-full min-h-[44px] rounded-xl border border-ff-glow/20 bg-ff-void/80 px-4 text-white"
            />
          </label>
          <label className="block text-sm text-ff-mist sm:col-span-2">
            <span className="font-medium text-white">CTA URL</span>
            <input
              name="ctaUrl"
              placeholder="https://…"
              className="mt-2 w-full min-h-[44px] rounded-xl border border-ff-glow/20 bg-ff-void/80 px-4 text-white"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ff-mist sm:col-span-2">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-ff-glow/30" />
            Active (shown on site)
          </label>
          <button
            type="submit"
            className="min-h-[48px] rounded-xl bg-gradient-to-r from-ff-glow to-ff-glow-dim font-semibold text-ff-void ff-shadow-primary sm:col-span-2 sm:w-fit sm:px-8"
          >
            Add slide
          </button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-white">Current slides ({slides.length})</h2>
        <ul className="mt-4 space-y-4">
          {slides.map((s, idx) => (
            <li
              key={s.id}
              className="ff-card flex flex-col gap-4 rounded-2xl border border-ff-glow/12 bg-ff-void/50 p-4 sm:flex-row sm:items-center"
            >
              <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-ff-deep ring-1 ring-ff-glow/15">
                {s.type === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.mediaUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-ff-mist/60">
                    VIDEO
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium text-white">
                  {s.type} · order {s.sortOrder}
                  {!s.isActive && (
                    <span className="ml-2 text-amber-200/90">(inactive)</span>
                  )}
                </p>
                <p className="mt-1 truncate text-ff-mist/70">{s.mediaUrl}</p>
                {s.title && <p className="mt-1 text-ff-mint">{s.title}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={moveHeroSlide}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={idx === 0}
                    className="min-h-[44px] min-w-[44px] rounded-lg border border-ff-mint/25 px-3 text-ff-mist disabled:opacity-30"
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
                    className="min-h-[44px] min-w-[44px] rounded-lg border border-ff-mint/25 px-3 text-ff-mist disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
                <form action={toggleHeroSlideActive}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="min-h-[44px] rounded-lg border border-ff-glow/25 px-3 text-sm text-ff-glow"
                  >
                    {s.isActive ? "Deactivate" : "Activate"}
                  </button>
                </form>
                <form action={deleteHeroSlide}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="min-h-[44px] rounded-lg border border-red-500/30 px-3 text-sm text-red-300"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
