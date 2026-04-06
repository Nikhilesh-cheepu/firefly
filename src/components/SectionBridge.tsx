/** Thin vertical gradient between home sections — soft blend, no hard rule. */
export function SectionBridge({ className }: { className: string }) {
  return (
    <div
      className={"pointer-events-none h-5 w-full shrink-0 bg-gradient-to-b sm:h-6 " + className}
      aria-hidden
    />
  );
}
