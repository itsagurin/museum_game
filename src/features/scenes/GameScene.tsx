"use client";
import { motion, useIsPresent } from "framer-motion";

export function GameScene({
  children,
  reducedMotion,
}: {
  children: React.ReactNode;
  reducedMotion: boolean;
}) {
  const present = useIsPresent();
  return (
    <motion.section
      className="game-scene"
      aria-hidden={!present}
      inert={!present}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.05 : 0.28 }}
    >
      {children}
    </motion.section>
  );
}

