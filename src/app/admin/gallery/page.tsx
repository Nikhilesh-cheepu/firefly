import { GalleryGridManager } from "@/components/admin/GalleryGridManager";
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
          <GalleryGridManager images={images} />
        )}
      </section>
    </div>
  );
}
