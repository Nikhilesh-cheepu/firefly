import { adminLogin } from "@/app/admin/auth-actions";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ from?: string; error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const q = await searchParams;
  const configured = Boolean(process.env.ADMIN_PASSWORD?.trim());
  const err = q.error;

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-ff-mint/90">
          Firefly
        </p>
        <h1 className="mt-2 text-center font-[family-name:var(--font-display)] text-3xl text-ff-glow md:text-4xl">
          Admin sign in
        </h1>
        {!configured && (
          <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
            Set <code className="font-mono text-ff-glow">ADMIN_PASSWORD</code> in{" "}
            <code className="font-mono">.env.local</code> to enable login.
          </p>
        )}
        {err === "1" && (
          <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100">
            Incorrect password. Try again.
          </p>
        )}
        {err === "config" && (
          <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
            Server configuration error (check admin secrets and database env).
          </p>
        )}
        <form action={adminLogin} className="mt-10 space-y-5">
          <input
            type="hidden"
            name="next"
            value={q.from && q.from.startsWith("/admin") ? q.from : "/admin"}
          />
          <label className="block text-sm font-medium text-ff-mist">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={!configured}
              className="mt-2 w-full min-h-[48px] rounded-xl border border-ff-glow/20 bg-ff-void/80 px-4 text-white outline-none ring-ff-glow/30 transition placeholder:text-ff-mist/40 focus:border-ff-glow/40 focus:ring-2 disabled:opacity-50"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={!configured}
            className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-ff-glow to-ff-glow-dim font-semibold text-ff-void ff-shadow-primary transition hover:brightness-110 disabled:opacity-50"
          >
            Sign in
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-ff-mist/70">
          <Link href="/" className="text-ff-mint underline-offset-4 hover:underline">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
