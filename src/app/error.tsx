"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ff-glow">Something hiccuped</h1>
      <p className="mt-3 max-w-md text-sm text-ff-mist/80">
        The page hit a snag loading. Refresh usually fixes it — your chat button and bookings are still on the site.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-gradient-to-r from-[#D97706] to-[#92400e] px-6 py-3 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
