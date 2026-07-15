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
        { left: 280, top: 130 },
        { left: 476, top: 206, width: 16, height: 16 },
      ),
    ).toEqual({ x: 204, y: 88.48 });
  });
});

describe("light particle flight path", () => {
  it("builds one continuous curve from the feedback to the target", () => {
    const target = { x: 84, y: -240 };
    const path = buildLightParticlePath(target, { x: -22, y: -18 });

    expect(path.x).toHaveLength(9);
    expect(path.y).toHaveLength(9);
    expect(path.times).toHaveLength(9);
    expect({ x: path.x[0], y: path.y[0] }).toEqual({ x: 0, y: 0 });
    expect({ x: path.x.at(-1), y: path.y.at(-1) }).toEqual(target);
  });

  it("keeps moving through the final curve samples", () => {
    const path = buildLightParticlePath(
      { x: 84, y: -240 },
      { x: -22, y: -18 },
    );
    const finalSegmentLengths = [6, 7].map((index) =>
      Math.hypot(
        path.x[index + 1] - path.x[index],
        path.y[index + 1] - path.y[index],
      ),
    );

    expect(Math.min(...finalSegmentLengths)).toBeGreaterThan(20);
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
