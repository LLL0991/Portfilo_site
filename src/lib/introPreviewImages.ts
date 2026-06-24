export const INTRO_PREVIEW_COLUMNS = 12;
export const INTRO_PREVIEW_ROWS = 11;
export const INTRO_PREVIEW_COUNT = INTRO_PREVIEW_COLUMNS * INTRO_PREVIEW_ROWS;
export const INTRO_PREVIEW_PNG_INDEXES = new Set([1, 2, 9, 132]);

export const INTRO_PREVIEW_IMAGES = Array.from({ length: INTRO_PREVIEW_COUNT }, (_, index) => {
  const imageIndex = index + 1;
  const extension = INTRO_PREVIEW_PNG_INDEXES.has(imageIndex) ? "png" : "jpg";
  return `/images/home/intro-preview/${String(imageIndex).padStart(3, "0")}.${extension}`;
});

export function getIntroPreviewIndexFromPoint(
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  clientX: number,
  clientY: number,
) {
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const rawX = clientX - rect.left;
  const rawY = clientY - rect.top;
  const gridX = Math.floor(
    clamp(rawX / Math.max(rect.width, 1), 0, 0.9999) * INTRO_PREVIEW_COLUMNS,
  );
  const gridY = Math.floor(
    clamp(rawY / Math.max(rect.height, 1), 0, 0.9999) * INTRO_PREVIEW_ROWS,
  );

  return clamp(gridY * INTRO_PREVIEW_COLUMNS + gridX, 0, INTRO_PREVIEW_COUNT - 1);
}
