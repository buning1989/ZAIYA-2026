type TargetBounds = Pick<DOMRect, "left" | "top" | "width" | "height">;
type OverlayBounds = Pick<DOMRect, "left" | "top" | "width" | "height">;
type LayoutSize = {
  width: number;
  height: number;
};

const TARGET_SEED_Y_RATIO = 0.78;
const PARTICLE_PATH_SAMPLE_COUNT = 17;

export type LightRewardPoint = {
  x: number;
  y: number;
};

export type LightParticlePath = {
  x: number[];
  y: number[];
  times: number[];
};

export function getLightRewardTargetPoint(
  overlayBounds: OverlayBounds,
  overlayLayoutSize: LayoutSize,
  targetBounds: TargetBounds,
) {
  const scaleX = overlayLayoutSize.width
    ? overlayBounds.width / overlayLayoutSize.width
    : 1;
  const scaleY = overlayLayoutSize.height
    ? overlayBounds.height / overlayLayoutSize.height
    : 1;

  return {
    x:
      (targetBounds.left - overlayBounds.left + targetBounds.width / 2) /
      scaleX,
    // The sprout receives light at its seed/root area, below the SVG center.
    y:
      (targetBounds.top -
        overlayBounds.top +
        targetBounds.height * TARGET_SEED_Y_RATIO) /
      scaleY,
  };
}

export function buildLightParticlePath(
  target: LightRewardPoint,
  control: LightRewardPoint,
): LightParticlePath {
  const points = Array.from(
    { length: PARTICLE_PATH_SAMPLE_COUNT },
    (_, index) => {
      const t = index / (PARTICLE_PATH_SAMPLE_COUNT - 1);
      if (index === 0) return { x: 0, y: 0, time: 0 };
      if (index === PARTICLE_PATH_SAMPLE_COUNT - 1) {
        return { ...target, time: 1 };
      }

      const remaining = 1 - t;

      return {
        x: 2 * remaining * t * control.x + t * t * target.x,
        y: 2 * remaining * t * control.y + t * t * target.y,
        time: t,
      };
    },
  );

  return {
    x: points.map((point) => point.x),
    y: points.map((point) => point.y),
    times: points.map((point) => point.time),
  };
}

export function getLightRewardArrivalMs({
  startSeconds,
  particleCount,
  staggerSeconds,
  travelSeconds,
}: {
  startSeconds: number;
  particleCount: number;
  staggerSeconds: number;
  travelSeconds: number;
}): number {
  const finalParticleIndex = Math.max(0, particleCount - 1);

  return Math.round(
    (startSeconds + finalParticleIndex * staggerSeconds + travelSeconds) *
      1000,
  );
}
