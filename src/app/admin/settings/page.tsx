import { updateSiteSettings } from "@/app/admin/settings/actions";
import { getPrisma } from "@/lib/db";

export default async function AdminSettingsPage() {
  const prisma = getPrisma();
  const row = prisma
    ? ((await prisma.siteSettings.findUnique({ where: { id: "default" } })) ?? null)
    : null;

  if (!prisma) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
        <p className="font-medium">Database not configured</p>
        <p className="mt-2 text-sm opacity-90">
          Set <code className="text-ff-glow">DATABASE_URL</code> and/or{" "}
          <code className="text-ff-glow">DATABASE_PUBLIC_URL</code> in{" "}
          <code className="font-mono">.env.local</code>, then run{" "}
          <code className="font-mono">npm run db:push</code>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ff-glow">Site settings</h1>
      <p className="mt-2 text-sm text-ff-mist/80">
        Stored in Postgres. Public site merges these with optional{" "}
        <code className="text-ff-mint">NEXT_PUBLIC_*</code> env fallbacks.
      </p>

      <form action={updateSiteSettings} className="mt-10 space-y-8">
        <fieldset className="ff-card space-y-4 rounded-2xl border border-ff-glow/15 bg-ff-deep/40 p-6">
          <legend className="px-1 text-sm font-semibold text-ff-mint">Hero fallbacks</legend>
          <Field
            label="Hero video URL (if no slides)"
            name="heroVideoUrl"
            defaultValue={row?.heroVideoUrl ?? ""}
            placeholder="https://…"
          />
          <Field
            label="Hero poster URL"
            name="heroPosterUrl"
            defaultValue={row?.heroPosterUrl ?? ""}
            placeholder="https://…"
          />
        </fieldset>

        <fieldset className="ff-card space-y-4 rounded-2xl border border-ff-glow/15 bg-ff-deep/40 p-6">
          <legend className="px-1 text-sm font-semibold text-ff-mint">Home sticky bar (mobile)</legend>
          <p className="text-xs text-ff-mist/75">
            These values are saved in the database and appear on the public site as buttons under{" "}
            <span className="text-ff-mint">Book table</span> (phone opens the dialer, WhatsApp / Instagram /
            Location open in a new tab). Leave a field empty to hide that button.
          </p>
          <Field
            label="Book table link"
            name="bookTableUrl"
            defaultValue={row?.bookTableUrl ?? "#book"}
            placeholder="#book or https://…"
          />
          <Field
            label="Phone (shown as Phone — tap to call)"
            name="phone"
            defaultValue={row?.phone ?? ""}
            placeholder="+91… or local number"
          />
          <Field
            label="WhatsApp (number or full https://wa.me/… link)"
            name="whatsapp"
            defaultValue={row?.whatsapp ?? ""}
            placeholder="9198xxxxxxx"
          />
          <Field
            label="Instagram (profile or post URL)"
            name="instagram"
            defaultValue={row?.instagram ?? ""}
            placeholder="https://instagram.com/yourhandle"
          />
          <Field
            label="Location (Google Maps or Apple Maps link)"
            name="mapsUrl"
            defaultValue={row?.mapsUrl ?? ""}
            placeholder="https://maps.google.com/…"
          />
          <Field
            label="Contact email"
            name="contactEmail"
            type="email"
            defaultValue={row?.contactEmail ?? ""}
          />
        </fieldset>

        <button
          type="submit"
          className="min-h-[48px] w-full rounded-xl bg-gradient-to-r from-ff-glow to-ff-glow-dim font-semibold text-ff-void ff-shadow-primary transition hover:brightness-110 sm:w-auto sm:px-10"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-sm text-ff-mist">
      <span className="font-medium text-white">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 w-full min-h-[44px] rounded-xl border border-ff-glow/20 bg-ff-void/80 px-4 text-white outline-none focus:border-ff-glow/40 focus:ring-2 focus:ring-ff-glow/25"
      />
    </label>
  );
}
