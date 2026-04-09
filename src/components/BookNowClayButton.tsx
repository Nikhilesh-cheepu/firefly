/**
 * 3D pill “clay” CTA — circular emoji well + label. Firefly palette (deep forest + lime rim).
 * Use on /book reserve flow; home sticky bar uses the classic flat gradient instead.
 */

export const bookNowClayClassName =
  "group inline-flex min-h-[52px] w-full items-center gap-2.5 overflow-hidden rounded-full border border-ff-glow/30 " +
  "bg-gradient-to-b from-[#143528] via-[#0a1814] to-[#050a08] " +
  "pl-1.5 pr-4 py-1.5 font-[family-name:var(--font-manrope)] " +
  "shadow-[0_10px_32px_rgba(0,0,0,0.55),0_0_0_1px_rgba(212,255,92,0.06),inset_0_1px_0_rgba(212,255,92,0.16)] " +
  "transition-[transform,box-shadow,border-color] duration-200 hover:border-ff-glow/45 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_0_1px_rgba(212,255,92,0.1),inset_0_1px_0_rgba(212,255,92,0.22)] " +
  "active:scale-[0.98] disabled:opacity-100";

/** Muted pill when the form isn’t ready yet — same shape, readable on dark UI */
export const clayPillMutedClassName =
  "group inline-flex min-h-[52px] w-full cursor-not-allowed items-center gap-2.5 overflow-hidden rounded-full border border-zinc-600 " +
  "bg-gradient-to-b from-zinc-800/95 via-zinc-900 to-zinc-950 " +
  "pl-1.5 pr-4 py-1.5 font-[family-name:var(--font-manrope)] " +
  "shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]";

const wellActiveClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
  "bg-gradient-to-b from-[#1f5c45] to-[#0f3024] " +
  "shadow-[inset_0_4px_10px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)] " +
  "ring-1 ring-white/10";

const wellMutedClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
  "bg-gradient-to-b from-zinc-700 to-zinc-900 " +
  "shadow-[inset_0_3px_8px_rgba(0,0,0,0.45)] " +
  "ring-1 ring-white/5";

const emojiClass = "select-none text-[1.35rem] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]";

const textActiveClass =
  "min-w-0 flex-1 text-left text-[15px] font-bold leading-none tracking-tight text-[#f2f8f0] sm:text-[16px]";

const textMutedClass =
  "min-w-0 flex-1 text-left text-[15px] font-bold leading-none tracking-tight text-zinc-500 sm:text-[16px]";

export function ClayPillLabel({
  emoji,
  label,
  muted,
}: {
  emoji: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <>
      <span className={muted ? wellMutedClass : wellActiveClass} aria-hidden>
        <span className={emojiClass}>{emoji}</span>
      </span>
      <span className={muted ? textMutedClass : textActiveClass}>{label}</span>
    </>
  );
}
