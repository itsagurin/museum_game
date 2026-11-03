import type { Artwork, EraId } from "@/types/game";
import type { Milestone } from "@/components/ProgressNotices";

export type Panel =
  | { type: "settings" | "info" }
  | { type: "story" | "studio"; artwork: Artwork }
  | { type: "locked"; eraId: EraId }
  | { type: "milestone"; milestone: Milestone };
