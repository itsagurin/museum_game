/** Persist before deciding whether an immediately reopened board should resume the intro. */
export const paintingSaveEvent = "heritage:save-painting";
export const flushPaintingSession = () => window.dispatchEvent(new Event(paintingSaveEvent));
