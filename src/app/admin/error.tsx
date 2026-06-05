"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-red-500/35 bg-red-500/10 p-6 text-red-100">
      <p className="font-medium">Something went wrong in admin</p>
      <p className="mt-2 text-sm opacity-90">
        {error.message || "An unexpected error occurred. Try again or check database / Blob configuration."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg border border-ff-glow/35 bg-ff-deep/60 px-4 py-2 text-sm font-medium text-white transition hover:border-ff-glow/55"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-ff-mint/25 px-4 py-2 text-sm text-ff-mist transition hover:text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
