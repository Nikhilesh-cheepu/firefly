"use client";

import { useEffect, useRef, useState } from "react";

type GetVideo = () => HTMLVideoElement | null;

/**
 * 0–1 intensity from bass-heavy FFT bins on the active (unmuted) hero video.
 * Reuses one MediaElementSource per HTMLVideoElement (browser requirement).
 * AudioContext stays open while the hero is mounted so mute/unmute can reconnect safely.
 */
export function useHeroVideoBeat(
  getVideo: GetVideo,
  enabled: boolean,
  reduceMotion: boolean,
): number {
  const [energy, setEnergy] = useState(0);
  const getVideoRef = useRef(getVideo);
  getVideoRef.current = getVideo;

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceByVideoRef = useRef(
    new WeakMap<HTMLVideoElement, MediaElementAudioSourceNode>(),
  );
  const routedVideoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef(0);
  const smoothRef = useRef(0);
  const prevAvgRef = useRef(0);
  const dataBufRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      const prev = routedVideoRef.current;
      if (prev) {
        try {
          sourceByVideoRef.current.get(prev)?.disconnect();
        } catch {
          /* ignore */
        }
        routedVideoRef.current = null;
      }
      sourceByVideoRef.current = new WeakMap();
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        void ctxRef.current.close();
      }
      ctxRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || !enabled) {
      cancelAnimationFrame(rafRef.current);
      smoothRef.current = 0;
      prevAvgRef.current = 0;
      dataBufRef.current = null;
      setEnergy(0);
      const prev = routedVideoRef.current;
      if (prev) {
        try {
          sourceByVideoRef.current.get(prev)?.disconnect();
        } catch {
          /* ignore */
        }
        routedVideoRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const getCtx = () => {
      if (!ctxRef.current) {
        const AC =
          typeof window !== "undefined"
            ? window.AudioContext ||
              (
                window as unknown as {
                  webkitAudioContext: typeof AudioContext;
                }
              ).webkitAudioContext
            : null;
        if (!AC) return null;
        const ctx = new AC();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.5;
        analyser.connect(ctx.destination);
        ctxRef.current = ctx;
        analyserRef.current = analyser;
      }
      return ctxRef.current;
    };

    const routeTo = (ctx: AudioContext, analyser: AnalyserNode, v: HTMLVideoElement) => {
      const prev = routedVideoRef.current;
      if (prev && prev !== v) {
        const pSrc = sourceByVideoRef.current.get(prev);
        try {
          pSrc?.disconnect();
        } catch {
          /* ignore */
        }
      }

      let src = sourceByVideoRef.current.get(v);
      if (!src) {
        try {
          src = ctx.createMediaElementSource(v);
          sourceByVideoRef.current.set(v, src);
        } catch {
          return false;
        }
      }

      try {
        src.connect(analyser);
      } catch {
        /* already linked */
      }
      routedVideoRef.current = v;
      void ctx.resume().catch(() => {});
      return true;
    };

    const tick = () => {
      if (cancelled) return;

      const v = getVideoRef.current();

      if (!v || document.hidden) {
        smoothRef.current *= 0.88;
        setEnergy(smoothRef.current);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const ctx = getCtx();
      const analyser = analyserRef.current;
      if (!ctx || !analyser) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (v !== routedVideoRef.current) {
        const ok = routeTo(ctx, analyser, v);
        if (!ok) {
          smoothRef.current *= 0.9;
          setEnergy(smoothRef.current);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        dataBufRef.current = new Uint8Array(analyser.frequencyBinCount);
      }

      let data = dataBufRef.current;
      if (!data || data.length !== analyser.frequencyBinCount) {
        data = new Uint8Array(analyser.frequencyBinCount);
        dataBufRef.current = data;
      }

      analyser.getByteFrequencyData(
        data as unknown as Parameters<AnalyserNode["getByteFrequencyData"]>[0],
      );
      let sum = 0;
      const n = 12;
      for (let i = 0; i < n; i++) sum += data[i]!;
      const avg = sum / n / 255;
      const spike = avg > prevAvgRef.current + 0.11 ? 0.2 : 0;
      prevAvgRef.current = avg * 0.87 + prevAvgRef.current * 0.13;
      const target = Math.min(1, avg * 2.35 + spike);
      smoothRef.current = smoothRef.current * 0.76 + target * 0.24;
      setEnergy(smoothRef.current);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      smoothRef.current = 0;
      prevAvgRef.current = 0;
      dataBufRef.current = null;
      setEnergy(0);
      const prev = routedVideoRef.current;
      if (prev) {
        try {
          sourceByVideoRef.current.get(prev)?.disconnect();
        } catch {
          /* ignore */
        }
        routedVideoRef.current = null;
      }
    };
  }, [enabled, reduceMotion]);

  return energy;
}
