"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/app/admin/auth-actions";
import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="min-h-[100dvh] bg-ff-hero-void">{children}</div>;
  }

  return (
    <div className="min-h-[100dvh] bg-ff-hero-void pb-8">
      <header className="sticky top-0 z-40 border-b border-ff-glow/15 bg-ff-void/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/admin"
            className="font-[family-name:var(--font-display)] text-xl text-ff-glow"
            style={{ textShadow: "0 0 20px rgba(200,255,120,0.25)" }}
          >
            Firefly admin
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/admin/settings"
              className="rounded-lg px-3 py-2 text-ff-mist transition hover:bg-ff-deep hover:text-white"
            >
              Settings
            </Link>
            <Link
              href="/admin/hero"
              className="rounded-lg px-3 py-2 text-ff-mist transition hover:bg-ff-deep hover:text-white"
            >
              Hero slides
            </Link>
            <Link
              href="/admin/gallery"
              className="rounded-lg px-3 py-2 text-ff-mist transition hover:bg-ff-deep hover:text-white"
            >
              Gallery
            </Link>
            <Link
              href="/admin/bookings"
              className="rounded-lg px-3 py-2 text-ff-mist transition hover:bg-ff-deep hover:text-white"
            >
              Bookings
            </Link>
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-ff-mist transition hover:bg-ff-deep hover:text-white"
            >
              View site
            </Link>
            <form action={adminLogout}>
              <button
                type="submit"
                className="rounded-lg border border-ff-mint/25 px-3 py-2 text-ff-mist transition hover:border-ff-glow/35 hover:text-white"
              >
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 pt-8">{children}</div>
    </div>
  );
}
