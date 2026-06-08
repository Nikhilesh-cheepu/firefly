type Props = {
  muted: boolean;
  className?: string;
};

export function HeroMuteIcon({ muted, className = "h-[18px] w-[18px]" }: Props) {
  if (muted) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 9v6h4l5 4V5L7 9H3zM16.5 8.5l5 7M21.5 8.5l-5 7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 9v6h4l5 4V5L7 9H3zM16 9.5a4.5 4.5 0 010 5M18.8 7a8 8 0 010 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
