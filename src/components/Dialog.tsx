"use client";

import { useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { motion, useIsPresent, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

interface DialogProps {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
  gentle: boolean;
  variant?: "default" | "coloring";
}

export function Dialog({
  title,
  closeLabel,
  onClose,
  children,
  gentle,
  variant = "default",
}: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const present = useIsPresent();
  const reduced = useReducedMotion() || gentle;
  useEffect(() => {
    if (!present) return;
    const dialogElement = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const elements = Array.from(ref.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
      ) || []).filter((element) => element.getClientRects().length > 0);
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (dialogElement?.contains(document.activeElement)) previousFocus?.focus();
    };
  }, [onClose, present]);

  return createPortal(
    <motion.div
      className={`dialog-backdrop ${variant === "coloring" ? "coloring-backdrop" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-hidden={!present}
        inert={!present}
        aria-labelledby={titleId}
        className={`dialog-panel glass ${variant === "coloring" ? "heritage-coloring" : ""}`}
        initial={{ y: reduced ? 0 : 35, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: reduced ? 0 : 25, opacity: 0 }}
        transition={{ duration: reduced ? 0.05 : 0.25 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-top">
          <h2 id={titleId}>{title}</h2>
          <button
            className="icon-button"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>,
    document.fullscreenElement || document.body,
  );
}
