"use client";

import { useCallback, useEffect, useState } from "react";
import { isEraId } from "@/data/eras";
import type { View } from "@/types/game";

const viewFromHash = (): View => {
  const hash = window.location.hash.slice(1);
  if (hash === "hall" || hash === "library" || isEraId(hash)) return hash;
  return "home";
};

export function useSceneNavigation() {
  const [view, setView] = useState<View>("home");
  useEffect(() => {
    const update = () => setView(viewFromHash());
    update();
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
    };
  }, []);
  const navigate = useCallback((next: View) => {
    if (next === viewFromHash()) return;
    window.history.pushState(null, "", `#${next}`);
    setView(next);
  }, []);
  return { view, navigate };
}
