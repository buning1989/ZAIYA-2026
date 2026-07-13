/* —— 情绪记录步骤选择模式基线测试 ——
 * 固化以下规则，防止后续审计或开发按旧规则误改：
 *   - Step1（一级情绪）：单选，自动前进
 *   - Step2（具体感受）：多选，不自动前进
 *   - Step3（可能相关原因）：多选，不自动前进
 *   - 特殊情况大类：单选，自动前进
 *   - 特殊情况细项：多选，不自动前进 */
import { describe, it, expect } from "vitest";
import {
  MOOD_STEP_CONFIG,
  isSingleSelectStep,
  shouldAutoAdvance,
  getMoodPolarity,
  primaryMoods,
  type PrimaryMoodScore,
} from "../moodOptions";

describe("MOOD_STEP_CONFIG 基线", () => {
  it("Step1（一级情绪）为单选 + 自动前进", () => {
    expect(MOOD_STEP_CONFIG.level.selectionMode).toBe("single");
    expect(MOOD_STEP_CONFIG.level.autoAdvance).toBe(true);
  });

  it("Step2（具体感受）为多选 + 不自动前进", () => {
    expect(MOOD_STEP_CONFIG.feelings.selectionMode).toBe("multiple");
    expect(MOOD_STEP_CONFIG.feelings.autoAdvance).toBe(false);
  });

  it("Step3（可能相关原因）为多选 + 不自动前进", () => {
    expect(MOOD_STEP_CONFIG.reasons.selectionMode).toBe("multiple");
    expect(MOOD_STEP_CONFIG.reasons.autoAdvance).toBe(false);
  });

  it("特殊情况大类为单选 + 自动前进", () => {
    expect(MOOD_STEP_CONFIG.specialCategory.selectionMode).toBe("single");
    expect(MOOD_STEP_CONFIG.specialCategory.autoAdvance).toBe(true);
  });

  it("特殊情况细项为多选 + 不自动前进", () => {
    expect(MOOD_STEP_CONFIG.specialDetails.selectionMode).toBe("multiple");
    expect(MOOD_STEP_CONFIG.specialDetails.autoAdvance).toBe(false);
  });
});

describe("isSingleSelectStep 查询函数", () => {
  it("level 和 specialCategory 返回 true", () => {
    expect(isSingleSelectStep("level")).toBe(true);
    expect(isSingleSelectStep("specialCategory")).toBe(true);
  });

  it("feelings / reasons / specialDetails 返回 false", () => {
    expect(isSingleSelectStep("feelings")).toBe(false);
    expect(isSingleSelectStep("reasons")).toBe(false);
    expect(isSingleSelectStep("specialDetails")).toBe(false);
  });
});

describe("shouldAutoAdvance 查询函数", () => {
  it("单选步骤自动前进", () => {
    expect(shouldAutoAdvance("level")).toBe(true);
    expect(shouldAutoAdvance("specialCategory")).toBe(true);
  });

  it("多选步骤不自动前进（第一次点击不会触发前进）", () => {
    expect(shouldAutoAdvance("feelings")).toBe(false);
    expect(shouldAutoAdvance("reasons")).toBe(false);
    expect(shouldAutoAdvance("specialDetails")).toBe(false);
  });
});

describe("getMoodPolarity 极性推导", () => {
  it("1 分（很糟）为 negative", () => {
    expect(getMoodPolarity(1 as PrimaryMoodScore)).toBe("negative");
  });

  it("2 分（不太好）为 negative", () => {
    expect(getMoodPolarity(2 as PrimaryMoodScore)).toBe("negative");
  });

  it("3 分（一般）为 neutral", () => {
    expect(getMoodPolarity(3 as PrimaryMoodScore)).toBe("neutral");
  });

  it("4 分（还行）为 positive", () => {
    expect(getMoodPolarity(4 as PrimaryMoodScore)).toBe("positive");
  });

  it("5 分（很好）为 positive", () => {
    expect(getMoodPolarity(5 as PrimaryMoodScore)).toBe("positive");
  });
});

describe("primaryMoods 配置一致性", () => {
  it("每个一级情绪的 polarity 与 getMoodPolarity 一致", () => {
    for (const mood of primaryMoods) {
      expect(mood.polarity).toBe(getMoodPolarity(mood.score));
    }
  });

  it("3 分（一般）不再是 positive", () => {
    const mood3 = primaryMoods.find((m) => m.score === 3);
    expect(mood3).toBeDefined();
    expect(mood3!.polarity).not.toBe("positive");
    expect(mood3!.polarity).toBe("neutral");
  });
});
