import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DEMO_GUIDED_REFERENCE_DATE,
  DEMO_USER_PROFILE,
} from "../demoUser";
import { EXPERIENCE_USER_PROFILE } from "@/apps/experience/data/experienceUser";
import {
  day2PraiseDemo,
  xiaochenTwoWeekSummary,
} from "@/components/demo/scenarios/xiaochenTwoWeekSummary";
import { XIAOCHEN_ORGANIZE_DISCLOSURE } from "@/apps/experience/data/xiaochen/organize";

const summarySourcePath = fileURLToPath(
  new URL(
    "../../../../components/demo/scenarios/xiaochenTwoWeekSummary.ts",
    import.meta.url,
  ),
);

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe("小晨体重语义与固定剧情 disclosure 回归", () => {
  it("固定剧情用户资料使用参考日前最近一次体重记录", () => {
    expect(DEMO_GUIDED_REFERENCE_DATE).toBe("2026-05-30");
    expect(DEMO_USER_PROFILE.bodyInfo.weightKg).toBe(50.7);
    expect(DEMO_USER_PROFILE.bodyInfo.weightUpdatedAt).toBe("2026-05-30");
  });

  it("自由体验用户资料使用参考日前最近一次体重记录", () => {
    expect(EXPERIENCE_USER_PROFILE.bodyInfo.weightKg).toBe(50.4);
    expect(EXPERIENCE_USER_PROFILE.bodyInfo.weightUpdatedAt).toBe("2026-07-15");
  });

  it("两个模式体重字段互不污染", () => {
    expect(DEMO_USER_PROFILE.bodyInfo.weightKg).not.toBe(
      EXPERIENCE_USER_PROFILE.bodyInfo.weightKg,
    );
    expect(DEMO_USER_PROFILE.bodyInfo.weightUpdatedAt).not.toBe(
      EXPERIENCE_USER_PROFILE.bodyInfo.weightUpdatedAt,
    );
  });

  it("固定剧情 summary 导出对象不包含 disclosure 或晚于 2026-05-30 的日期", () => {
    const exportedStrings = collectStrings({
      day2PraiseDemo,
      xiaochenTwoWeekSummary,
    });

    expect(JSON.stringify({ day2PraiseDemo, xiaochenTwoWeekSummary })).not.toMatch(
      /disclosure|riskDisclosures|originalRecords/i,
    );
    expect(exportedStrings.some((text) => /2026-0[67]/.test(text))).toBe(false);
  });

  it("固定剧情 summary 不再依赖共享 createMockDisclosure", () => {
    const source = readFileSync(summarySourcePath, "utf8");

    expect(source).not.toContain("createMockDisclosure");
    expect(source).not.toContain("2026-06");
    expect(source).not.toContain("2026-07");
  });

  it("自由体验高风险记录不受固定剧情清理影响", () => {
    expect(XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords.map((r) => r.recordedAt)).toEqual([
      "2026-06-24T01:32:00+08:00",
      "2026-07-06T01:48:00+08:00",
    ]);
  });
});
