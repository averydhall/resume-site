"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  durationMs?: number;
  onComplete?: (value: number) => void;
};

export function useAnimatedProgress({ durationMs = 650, onComplete }: Options = {}) {
  const [progress, setProgress] = useState(0);
  const [reversing, setReversing] = useState(false);

  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const fromRef = useRef<number>(0);
  const toRef = useRef<number>(0);

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const commit = useCallback((value: number) => {
    progressRef.current = value;
    setProgress(value);
  }, []);

  const tweenTo = useCallback(
    (target: number, duration = durationMs) => {
      cancel();
      const from = progressRef.current;
      const to = Math.max(0, Math.min(1, target));
      if (duration <= 0 || Math.abs(to - from) < 0.001) {
        commit(to);
        setReversing(false);
        onComplete?.(to);
        return;
      }
      fromRef.current = from;
      toRef.current = to;
      startRef.current = performance.now();
      setReversing(to < from);
      const step = (now: number) => {
        const t = Math.max(0, Math.min(1, (now - startRef.current) / duration));
        const next = fromRef.current + (toRef.current - fromRef.current) * t;
        commit(next);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
          setReversing(false);
          onComplete?.(toRef.current);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [cancel, commit, durationMs, onComplete]
  );

  const setProgressImmediate = useCallback(
    (v: number) => {
      cancel();
      commit(v);
      setReversing(false);
    },
    [cancel, commit]
  );

  useEffect(() => () => cancel(), [cancel]);

  return { progress, reversing, tweenTo, setProgressImmediate };
}
