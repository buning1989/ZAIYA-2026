type TargetBounds = Pick<DOMRect, "left" | "top" | "width" | "height">;

const TARGET_SEED_Y_RATIO = 0.78;

export function getLightRewardTargetPoint(
  overlayBounds: Pick<DOMRect, "left" | "top">,
  targetBounds: TargetBounds,
) {
  return {
    x: targetBounds.left - overlayBounds.left + targetBounds.width / 2,
    // The sprout receives light at its seed/root area, below the SVG center.
    y:
      targetBounds.top -
      overlayBounds.top +
      targetBounds.height * TARGET_SEED_Y_RATIO,
  };
}
