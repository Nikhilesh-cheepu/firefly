import Image from "next/image";

type Props = {
  className?: string;
  variant?: "hero" | "compact";
};

export function FireflyLogo({ className = "", variant = "compact" }: Props) {
  const isHero = variant === "hero";

  return (
    <div
      className={`flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4 md:items-end ${className}`}
    >
      <div
        className={`relative shrink-0 ${isHero ? "h-16 w-16 sm:h-20 sm:w-20" : "h-10 w-10"}`}
        style={{
          filter:
            "drop-shadow(0 0 18px rgba(200, 255, 120, 0.55)) drop-shadow(0 0 42px rgba(124, 245, 198, 0.35))",
        }}
      >
        <Image
          src="/firefly-logo.svg"
          alt=""
          width={120}
          height={120}
          className="h-full w-full object-contain"
          priority={isHero}
        />
      </div>
      <div className="text-center sm:text-left">
        <h1
          className={`font-[family-name:var(--font-display)] font-normal tracking-[0.02em] ${
            isHero
              ? "text-5xl leading-none text-ff-glow sm:text-7xl md:text-8xl"
              : "text-2xl text-ff-glow"
          }`}
          style={{
            textShadow:
              "0 0 32px rgba(200, 255, 120, 0.45), 0 0 80px rgba(124, 245, 198, 0.25)",
          }}
        >
          Firefly
        </h1>
        {isHero && (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.42em] text-ff-mint">
            Telugu club
          </p>
        )}
      </div>
    </div>
  );
}
