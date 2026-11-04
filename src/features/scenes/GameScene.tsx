"use client";

export function GameScene({ children, reducedMotion, animate }: {
  children: React.ReactNode; reducedMotion: boolean; animate: boolean;
}) {
  return <section className={`game-scene ${animate ? "scene-enter" : ""}`} aria-hidden={false}
    style={animate ? { animationDuration: reducedMotion ? "50ms" : "280ms" } : undefined}>
    {children}
  </section>;
}
