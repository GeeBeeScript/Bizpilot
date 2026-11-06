"use client";

import { useCallback, useState } from "react";

/** Tab state mirrored into ?tab= without a navigation, so tabs are linkable and survive refresh */
export function useTabParam<T extends string>(initial: T) {
  const [tab, setTabState] = useState<T>(initial);
  const setTab = useCallback((next: T) => {
    setTabState(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }, []);
  return [tab, setTab] as const;
}
