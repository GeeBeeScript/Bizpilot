"use client";

import { useCallback, useSyncExternalStore } from "react";

const noop = () => () => {};

/** true after hydration — avoids setState-in-effect "mounted" patterns */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

/** Media query subscription. `serverValue` is used for SSR and the first client render. */
export function useMediaQuery(query: string, serverValue = true) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => serverValue);
}

const STORAGE_EVENT = "bp-local-storage";

/**
 * localStorage-backed string value (per-viewer conveniences such as dashboard layout).
 * Returns null on the server and when storage is unavailable.
 */
export function useLocalStorage(key: string) {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("storage", cb);
    window.addEventListener(STORAGE_EVENT, cb);
    return () => {
      window.removeEventListener("storage", cb);
      window.removeEventListener(STORAGE_EVENT, cb);
    };
  }, []);
  const read = () => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const value = useSyncExternalStore(subscribe, read, () => null);
  const set = useCallback(
    (v: string) => {
      try {
        localStorage.setItem(key, v);
      } catch {}
      window.dispatchEvent(new Event(STORAGE_EVENT));
    },
    [key],
  );
  return [value, set] as const;
}
