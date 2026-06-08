"use client";

import { useEffect, useState } from "react";

/** True only after the first client commit — keeps SSR and hydration HTML identical. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
