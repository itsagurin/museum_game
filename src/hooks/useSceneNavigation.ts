"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isEraId } from "@/data/eras";
import type { View } from "@/types/game";

const viewFromHash = (): View => {
  const hash = window.location.hash.slice(1);
  return hash === "hall" || hash === "library" || isEraId(hash) ? hash : "home";
};
const subscribe = (notify: () => void) => {
  for (const event of ["hashchange", "popstate", "heritage:navigate"]) window.addEventListener(event, notify);
  return () => { for (const event of ["hashchange", "popstate", "heritage:navigate"]) window.removeEventListener(event, notify); };
};

export function useSceneNavigation() {
  const view = useSyncExternalStore(subscribe, viewFromHash, () => "home" as View);
  const navigate = useCallback((next: View, { replace = false }: { replace?: boolean } = {}) => {
    if (next !== viewFromHash()) {
      // Preserve Next's history metadata when updating a hash without a route transition.
      window.history[replace ? "replaceState" : "pushState"](window.history.state, "", `#${next}`);
    }
    window.dispatchEvent(new Event("heritage:navigate"));
  }, []);
  return { view, navigate };
}
