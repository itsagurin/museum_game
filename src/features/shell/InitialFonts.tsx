import content from "@/data/content-summaries.json" with { type: "json" };

/** Preload the font subsets and images used by a direct visit to each view. */
export function InitialFonts() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const thumbnails = content.slice(0, 2).map(entry => `${base}/art/_thumbs/${entry.image.replace(/\.[^/.]+$/, ".webp")}`);
  const script = `(() => {
    const base = ${JSON.stringify(base)};
    const interior = /^#(?:hall|library|era-[1-4])$/.test(location.hash);
    const fonts = ["dm-sans-latin-400", "dm-sans-latin-ext-400", "cormorant-garamond-latin-600",
      ...(interior ? ["cormorant-garamond-latin-ext-600", "dm-sans-latin-600",
        ...(location.hash === "#library" ? [] : ["dm-sans-latin-ext-600"])]
        : ["cormorant-garamond-latin-500", "cormorant-garamond-latin-ext-500"])];
    for (const font of fonts) {
      const link = document.createElement("link");
      link.rel = "preload"; link.as = "font"; link.type = "font/woff2"; link.crossOrigin = "anonymous";
      link.href = base + "/fonts/" + font + "-normal.woff2";
      document.head.appendChild(link);
    }
    const images = /^#era-[1-4]$/.test(location.hash)
      ? [base + "/art/blank_paper_crossmark.jpg", base + "/art/_scenes/room" + location.hash.at(-1) + ".avif"]
      : location.hash === "#library" ? ${JSON.stringify(thumbnails)} : [];
    for (const href of images) {
      const link = document.createElement("link");
      link.rel = "preload"; link.as = "image"; link.fetchPriority = "high"; link.href = href;
      document.head.appendChild(link);
    }
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: script.replaceAll("<", "\\u003c") }} />;
}
