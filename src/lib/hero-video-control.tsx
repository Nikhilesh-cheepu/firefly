"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type HeroVideoControlValue = {
  isVideoHero: boolean;
  setIsVideoHero: (value: boolean) => void;
  muted: boolean;
  toggleMuted: () => void;
};

const HeroVideoControlContext = createContext<HeroVideoControlValue | null>(null);

export function HeroVideoControlProvider({
  children,
  heroHasVideo = false,
}: {
  children: ReactNode;
  heroHasVideo?: boolean;
}) {
  const [isVideoHero, setIsVideoHero] = useState(heroHasVideo);
  const [muted, setMuted] = useState(true);
  const toggleMuted = useCallback(() => setMuted((prev) => !prev), []);

  const value = useMemo(
    () => ({ isVideoHero, setIsVideoHero, muted, toggleMuted }),
    [isVideoHero, muted, toggleMuted]
  );

  return (
    <HeroVideoControlContext.Provider value={value}>{children}</HeroVideoControlContext.Provider>
  );
}

export function useHeroVideoControl(): HeroVideoControlValue | null {
  return useContext(HeroVideoControlContext);
}
