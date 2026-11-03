import { describe, expect, it } from "vitest";
import { useGameStore } from "./useGameStore";
import { usePaintingProgress } from "./usePaintingProgress";
import { artworks, content, wallSlots } from "../data/eras";
import { encodeCells } from "../lib/painting-progress";

describe("save compatibility", () => {
  it("preserves legacy completions and wall assignments while validating new defaults", () => {
    const entry = content[1], slot = wallSlots[0];
    const saved = {completedArtworkIds: [entry.legacyIds[0]], wallAssignments: {[slot.id]:entry.legacyIds[0]}};
    const merged = useGameStore.persist.getOptions().merge!(saved, useGameStore.getState());
    expect(merged.dailyHistory).toEqual([]);
    expect(merged.dailySelection).toBeNull();
    expect(merged.tutorialSeen).toBe(false);
    expect(typeof merged.highContrast).toBe("boolean");
    expect(merged.completedArtworkIds).toEqual([entry.id]);
    expect(merged.wallAssignments[slot.id]).toBe(entry.id);
  });
  it("validates daily dates and selections without changing collection progress", () => {
    const merged=useGameStore.persist.getOptions().merge!({dailyHistory:["2026-02-30","2026-11-03","2026-11-03"],dailySelection:{dateKey:"invalid",artworkId:artworks[0].id},completedArtworkIds:[artworks[0].id]},useGameStore.getState());
    expect(merged.dailyHistory).toEqual(["2026-11-03"]);
    expect(merged.dailySelection).toBeNull();
    expect(merged.completedArtworkIds).toEqual([artworks[0].id]);
  });
  it("keeps matching boards, discards changed signatures and isolates damaged entries", () => {
    const [first, second] = artworks;
    const entry = {signature:first.puzzleVersion!,total:1024,painted:1,cells:encodeCells([0],1024),updatedAt:1};
    const merge = usePaintingProgress.persist.getOptions().merge!;
    const merged = merge({paintings:{[first.id]:entry,[second.id]:{...entry,signature:"stale"},unknown:entry}}, usePaintingProgress.getState());
    expect(Object.keys(merged.paintings)).toEqual([first.id]);
    expect(merged.paintings[first.id]).toEqual(entry);
  });
  it("clears a stale entry when a board is opened", () => {
    const first = artworks[0];
    usePaintingProgress.persist.setOptions({storage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}});
    usePaintingProgress.getState().save(first.id,"old",16,[1]);
    expect(usePaintingProgress.getState().load(first.id,first.puzzleVersion!,16)).toEqual([]);
    expect(usePaintingProgress.getState().paintings[first.id]).toBeUndefined();
  });
});
