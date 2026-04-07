import { deleteGalleryImage, moveGalleryImage } from "@/app/admin/gallery/actions";
import { GalleryUploadForm } from "@/components/admin/GalleryUploadForm";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
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

  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ff-glow">Gallery</h1>
      <p className="mt-2 text-sm text-ff-mist/75">
        Upload images for the home page bento grid. Large files are compressed to under 5MB before upload.
      </p>

      <section className="mt-8 ff-card rounded-2xl border border-ff-glow/15 bg-ff-deep/40 p-6">
        <GalleryUploadForm />
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ff-mist/55">
          Images · {images.length}
        </h2>
        {images.length === 0 ? (
          <p className="mt-4 text-sm text-ff-mist/60">Nothing here yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {images.map((img, idx) => (
              <li
                key={img.id}
                className="ff-card flex flex-wrap items-center gap-4 rounded-xl border border-ff-glow/12 bg-ff-void/50 p-3"
              >
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-ff-deep ring-1 ring-ff-glow/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </div>

                <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:justify-end">
                  <form action={moveGalleryImage}>
                    <input type="hidden" name="id" value={img.id} />
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
                  <form action={moveGalleryImage}>
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={idx === images.length - 1}
                      className="min-h-[44px] min-w-[44px] rounded-lg border border-ff-mint/20 text-ff-mist transition hover:border-ff-glow/35 hover:text-white disabled:opacity-25"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </form>
                  <form action={deleteGalleryImage}>
                    <input type="hidden" name="id" value={img.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/15"
                    >
                      Delete
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
