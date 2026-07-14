import { describe, expect, it } from "vitest";
import { getLightRewardKind, getLightRewardTitle } from "../lightReward";

function at(hhmm: string) {
  return new Date(`2026-07-14T${hhmm}:00+08:00`);
}

describe("getLightRewardKind", () => {
  it("00:00-05:59 maps to starlight", () => {
    expect(getLightRewardKind(at("00:00"))).toBe("starlight");
    expect(getLightRewardKind(at("05:59"))).toBe("starlight");
  });

  it("06:00-17:59 maps to sunlight", () => {
    expect(getLightRewardKind(at("06:00"))).toBe("sunlight");
    expect(getLightRewardKind(at("17:59"))).toBe("sunlight");
  });

  it("18:00-23:59 maps to moonlight", () => {
    expect(getLightRewardKind(at("18:00"))).toBe("moonlight");
    expect(getLightRewardKind(at("23:59"))).toBe("moonlight");
  });
});

describe("getLightRewardTitle", () => {
  it("formats the reward copy for each light kind", () => {
    expect(getLightRewardTitle("sunlight")).toBe("收下一点日光");
    expect(getLightRewardTitle("moonlight")).toBe("收下一点月光");
    expect(getLightRewardTitle("starlight")).toBe("收下一点星光");
  });
});
