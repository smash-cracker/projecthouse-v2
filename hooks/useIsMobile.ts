"use client";

import { useCallback, useSyncExternalStore } from "react";

// Reads the viewport from matchMedia instead of a post-mount effect. The
// server snapshot stays `false` (desktop) so SSR hydrates consistently, but the
// client snapshot is read during hydration, so mobile doesn't render the
// desktop layout first and then reflow.
export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`;

  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
