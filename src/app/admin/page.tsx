import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ff-glow md:text-4xl">
        Dashboard
      </h1>
      <p className="mt-2 text-ff-mist/85">Manage site content connected to Railway Postgres.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
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
      </ul>
    </div>
  );
}
