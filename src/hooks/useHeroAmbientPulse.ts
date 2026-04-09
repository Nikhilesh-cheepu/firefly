"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Soft 0–1 pulse for hero border / ambient visuals when the user has sound on.
 * Intentionally does NOT use Web Audio (MediaElementSource would hijack video output
 * and can silence playback if the AudioContext never resumes or the graph breaks).
 */
export function useHeroAmbientPulse(active: boolean, reduceMotion: boolean): number {
  const [energy, setEnergy] = useState(0);
  const t0Ref = useRef(0);

  useEffect(() => {
    if (reduceMotion || !active) {
      setEnergy(0);
      return;
    }

    t0Ref.current = performance.now();
    let id = 0;
    let frame = 0;

    const tick = (now: number) => {
      const t = (now - t0Ref.current) / 1000;
      const a = Math.sin(t * 7.2) * 0.36;
      const b = Math.sin(t * 14.6) * 0.26;
      const c = Math.sin(t * 3.1) * 0.16;
      const d = Math.max(0, Math.sin(t * 21.5)) * 0.22;
      const raw = 0.34 + a + b + c + d;
      const shaped = Math.min(1, Math.max(0, raw * 1.14 - 0.04));
      const v = Math.min(1, shaped ** 0.88);
      if (frame++ % 2 === 0) setEnergy(v);
      id = requestAnimationFrame(tick);
    };

    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active, reduceMotion]);

  return energy;
}
