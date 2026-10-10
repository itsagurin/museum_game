import database from "./artworks_db.json";
import { parseColoringArtwork, type ColoringArtwork } from "@/lib/coloring";

// Keep the algorithm's grids and palette IDs exactly as supplied by the team.
export const coloringArtworks: ColoringArtwork[] = database.map(parseColoringArtwork);

export const findColoringArtwork = (id: string | undefined) =>
  coloringArtworks.find((artwork) => artwork.id === id);

const localOriginals: Record<string, string> = {
  "stanczyk-matejko": "stanczyk.webp",
  "bociany-chelmonski": "bociany.webp",
};

export const originalImageFor = (artwork: ColoringArtwork) =>
  localOriginals[artwork.id]
    ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/artworks/${localOriginals[artwork.id]}`
    : artwork.original_image_url;

// English translations of the team's supplied cultural_data, not extra claims.
export const coloringStoriesEn: Record<string, { story: string; funFact: string }> = {
  "stanczyk-matejko": {
    story: "A symbol of national reflection and responsibility for the country's future. Jan Matejko gave the jester his own facial features.",
    funFact: "At Queen Bona's ball, Stańczyk alone grieves the loss of Smolensk while the Polish court enjoys the festivities in the next room.",
  },
  "babie-lato-chelmonski": {
    story: "A masterpiece of Polish realism, showing harmony between people and nature and the pastoral beauty of the lowlands.",
    funFact: "The painting caused a scandal at Warsaw's Society for the Encouragement of Fine Arts: critics were outraged by the country girl's dirty, bare feet.",
  },
  "bociany-chelmonski": {
    story: "An iconic Polish rural landscape, capturing farm work and the bond with the native land.",
    funFact: "The painting was made at the artist's estate in Kuklówka. The flying storks symbolised spring and hope for national revival during the partitions.",
  },
  "zydowka-z-pomaranczami-gierymski": {
    story: "One of the most important paintings of Polish luminism and urban realism, documenting multicultural Warsaw in the nineteenth century.",
    funFact: "Looted by the Germans during World War II, the painting was missing for almost seventy years before it was found at an auction in Buxtehude in 2010.",
  },
  "szal-uniesien-podkowinski": {
    story: "Considered a manifesto of Polish symbolism and Young Poland, combining passion with the destructive power of nature.",
    funFact: "On the thirty-sixth day of the exhibition, the artist entered the gallery and slashed the painting with a knife. The motives behind this dramatic act remain a romantic mystery.",
  },
};
