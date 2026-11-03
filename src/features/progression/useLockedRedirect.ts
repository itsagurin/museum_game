"use client";
import { useEffect, useRef } from "react";
import type { EraId, View } from "@/types/game";
import type { Panel } from "../shell/panels";

export function useLockedRedirect({ view, blockedEraId, navigate, closePanel, setPanel }: {
  view: View; blockedEraId: EraId | null;
  navigate: (view: View, options?: { replace?: boolean }) => void;
  closePanel: () => void; setPanel: (panel: Panel) => void;
}) {
  const lockedRedirect = useRef<EraId | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousView = useRef(view);
  useEffect(() => {
    if (view !== previousView.current) {
      closePanel();
      mainRef.current?.focus({ preventScroll: true });
      previousView.current = view;
      if (lockedRedirect.current) {
        setPanel({ type: "locked", eraId: lockedRedirect.current });
        lockedRedirect.current = null;
      }
    }
  }, [view, closePanel, setPanel]);
  useEffect(() => {
    // A bookmarked or typed address must not skip the era order.
    if (!blockedEraId) return;
    lockedRedirect.current = blockedEraId;
    navigate("hall", { replace: true });
  }, [blockedEraId, navigate]);

  return mainRef;
}
