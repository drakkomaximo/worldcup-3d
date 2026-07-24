"use client";

import { useEffect, useRef } from "react";

/**
 * Shared keyboard listener. The handler ref is kept fresh on every render,
 * so callers never need dependency arrays or eslint-disable comments and
 * the listener is attached exactly once.
 */
export function useKeydown(handler: (e: KeyboardEvent) => void) {
  const ref = useRef(handler);

  useEffect(() => {
    ref.current = handler;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => ref.current(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
