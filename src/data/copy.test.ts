import { expect, it } from "vitest";
import { copy } from "./copy";
import { eras } from "./eras";

it.each([[1,"obraz"],[2,"obrazy"],[4,"obrazy"],[5,"obrazów"],[12,"obrazów"],[22,"obrazy"]])("declines %i remaining paintings in era messages", (count, noun) => {
  expect(copy.pl.lockedBody("Romantyzm", eras[0].inEra.pl, count as number)).toBe(`Romantyzm otworzy się, gdy odnowisz jeszcze ${count} ${noun} w Oświeceniu.`);
});
it("uses a complete English prepositional phrase", () => {
  expect(copy.en.lockedBody("Romanticism", eras[0].inEra.en, 2)).toContain("2 more paintings in the Enlightenment");
});
