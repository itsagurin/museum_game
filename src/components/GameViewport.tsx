"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Expand,
  Move,
  Shrink,
} from "lucide-react";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import { sceneSize } from "@/data/scene";

interface GameViewportProps {
  children: ReactNode;
  className: string;
  focalY: number;
  label: string;
  lockCamera?: boolean;
  fixedOverview?: boolean;
}

export function GameViewport({
  children,
  className,
  focalY,
  label,
  lockCamera = false,
  fixedOverview = false,
}: GameViewportProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const [selectedOverview, setOverview] = useState(false);
  const overview = fixedOverview || selectedOverview;
  const [axis, setAxis] = useState<"x" | "y" | null>(null);
  const language = useGameStore((state) => state.language);
  const gentleMotion = useGameStore((state) => state.gentleMotion);
  const t = copy[language];

  const centerCamera = useCallback(() => {
    const viewport = ref.current;
    if (!viewport) return;
    const scene = viewport.firstElementChild as HTMLElement | null;
    scene?.style.setProperty("--scene-scale", String(scene.getBoundingClientRect().width / sceneSize.width));
    // Fixed home and hall compositions are positioned before hydration by CSS.
    if (lockCamera) {
      setAxis(null);
      return;
    }
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    viewport.scrollTop = Math.max(
      0,
      Math.min(
        viewport.scrollHeight - viewport.clientHeight,
        viewport.scrollHeight * focalY - viewport.clientHeight / 2,
      ),
    );
    setAxis(
      overview
        ? null
        : viewport.scrollWidth > viewport.clientWidth + 2
          ? "x"
          : viewport.scrollHeight > viewport.clientHeight + 2
            ? "y"
            : null,
    );
  }, [focalY, lockCamera, overview]);

  useEffect(() => {
    const viewport = ref.current;
    if (!viewport) return;
    const observer = new ResizeObserver(centerCamera);
    observer.observe(viewport);
    const frame = requestAnimationFrame(centerCamera);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [centerCamera]);

  const pan = (direction: number) => {
    const viewport = ref.current;
    if (!viewport) return;
    const reduced =
      gentleMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollBy({
      left: axis === "x" ? direction * viewport.clientWidth * 0.45 : 0,
      top: axis === "y" ? direction * viewport.clientHeight * 0.4 : 0,
      behavior: reduced ? "instant" : "smooth",
    });
  };

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || lockCamera || overview) return;
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      left: event.currentTarget.scrollLeft,
      top: event.currentTarget.scrollTop,
      moved: false,
    };
    suppressClick.current = false;
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) + Math.abs(y) > 8) {
      start.moved = true;
      suppressClick.current = true;
      if (!event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.scrollLeft = start.left - x;
      event.currentTarget.scrollTop = start.top - y;
    }
  };
  const pointerUp = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <>
      <div
        ref={ref}
        className={`game-viewport ${overview ? "overview" : ""} ${lockCamera ? "locked-camera" : ""}`}
        aria-label={label}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        <div className={`scene-canvas ${className}`}>{children}</div>
      </div>
      {!lockCamera && !fixedOverview && <div className="camera-controls glass" aria-label={t.camera}>
        {axis && (
          <button
            className="icon-button"
            aria-label={axis === "x" ? t.panLeft : t.panUp}
            onClick={() => pan(-1)}
          >
            {axis === "x" ? <ChevronLeft size={17} /> : <ChevronUp size={17} />}
          </button>
        )}
        <button
          className="icon-button"
          aria-label={overview ? t.immersiveView : t.overview}
          aria-pressed={overview}
          onClick={() => setOverview((value) => !value)}
        >
          {overview ? <Shrink size={17} /> : <Expand size={17} />}
        </button>
        {axis && (
          <button
            className="icon-button"
            aria-label={axis === "x" ? t.panRight : t.panDown}
            onClick={() => pan(1)}
          >
            {axis === "x" ? (
              <ChevronRight size={17} />
            ) : (
              <ChevronDown size={17} />
            )}
          </button>
        )}
      </div>}
      {axis && (
        <div className="camera-hint">
          <Move size={12} />
          {t.panHint}
        </div>
      )}
    </>
  );
}
