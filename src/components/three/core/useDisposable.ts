"use client";

import { useEffect, useMemo } from "react";

interface Disposable {
  dispose: () => void;
}

/**
 * useMemo for GPU resources: `factory` runs once per `key` (e.g. the perf tier) and every
 * returned resource is disposed when the key changes or the scene unmounts.
 */
export function useDisposable<T extends Disposable | Disposable[]>(
  factory: () => T,
  key: string | number,
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => factory(), [key]);
  useEffect(
    () => () => {
      for (const item of Array.isArray(value) ? value : [value]) item.dispose();
    },
    [value],
  );
  return value;
}
