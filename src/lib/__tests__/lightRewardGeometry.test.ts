import { describe, expect, it } from "vitest";
import { getLightRewardTargetPoint } from "../lightRewardGeometry";

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
