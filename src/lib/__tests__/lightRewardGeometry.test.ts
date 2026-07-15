import { describe, expect, it } from "vitest";
import {
  buildLightParticlePath,
  getLightRewardArrivalMs,
  getLightRewardTargetPoint,
} from "../lightRewardGeometry";

describe("light reward landing point", () => {
  it("lands in the sprout seed area instead of the button center", () => {
    expect(
      getLightRewardTargetPoint(
        { left: 280, top: 130, width: 390, height: 780 },
        { width: 390, height: 780 },
        { left: 476, top: 206, width: 16, height: 16 },
      ),
    ).toEqual({ x: 204, y: 88.48 });
  });

  it("normalizes rendered coordinates into a scaled overlay's layout space", () => {
    const target = getLightRewardTargetPoint(
      { left: 768, top: 213, width: 447.6, height: 915.6 },
      { width: 373, height: 763 },
      { left: 1161.6, top: 290, width: 19.2, height: 19.2 },
    );

    expect(target.x).toBeCloseTo(336);
    expect(target.y).toBeCloseTo(76.647);
  });
});

describe("light particle flight path", () => {
  it("builds one continuous curve from the feedback to the target", () => {
    const target = { x: 84, y: -240 };
    const path = buildLightParticlePath(target, { x: -22, y: -18 });

    expect(path.x).toHaveLength(17);
    expect(path.y).toHaveLength(17);
    expect(path.times).toHaveLength(17);
    expect({ x: path.x[0], y: path.y[0] }).toEqual({ x: 0, y: 0 });
    expect({ x: path.x.at(-1), y: path.y.at(-1) }).toEqual(target);
  });

  it("keeps moving through the final curve samples", () => {
    const path = buildLightParticlePath(
      { x: 84, y: -240 },
      { x: -22, y: -18 },
    );
    const finalSegmentStart = path.x.length - 3;
    const finalSegmentLengths = [
      finalSegmentStart,
      finalSegmentStart + 1,
    ].map((index) =>
      Math.hypot(
        path.x[index + 1] - path.x[index],
        path.y[index + 1] - path.y[index],
      ),
    );

    expect(Math.min(...finalSegmentLengths)).toBeGreaterThan(10);
  });

  it("derives arrival from the final staggered particle", () => {
    expect(
      getLightRewardArrivalMs({
        startSeconds: 1.78,
        particleCount: 3,
        staggerSeconds: 0.045,
        travelSeconds: 1.18,
      }),
    ).toBe(3050);
  });
});
