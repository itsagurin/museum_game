"use client";
import { useRef, useSyncExternalStore } from "react";
const subscribeFullscreen = (notify: () => void) => {
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
};
const readFullscreenAvailable = () => document.fullscreenEnabled === true;
const readFullscreen = () => Boolean(document.fullscreenElement);
const serverFullscreen = () => false;


export function useFullscreen() {
  const appRef = useRef<HTMLDivElement>(null);
  const fullscreenAvailable = useSyncExternalStore(subscribeFullscreen, readFullscreenAvailable, serverFullscreen);
  const fullscreen = useSyncExternalStore(subscribeFullscreen, readFullscreen, serverFullscreen);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await appRef.current?.requestFullscreen();
    } catch {
      /* The viewport remains immersive when the browser declines fullscreen. */
    }
  };
  return { appRef, fullscreenAvailable, fullscreen, toggleFullscreen };
}
