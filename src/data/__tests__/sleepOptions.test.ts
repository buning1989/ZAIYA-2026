import { describe, expect, it } from "vitest";
import { bedTimeRanges, wakeTimeRanges } from "../sleepOptions";

describe("sleep time point options", () => {
  it("uses one-hour granularity for bed time while keeping open endpoints", () => {
    expect(bedTimeRanges.map((option) => option.label)).toEqual([
      "9点前",
      "9点",
      "10点",
      "11点",
      "0点",
      "1点",
      "2点",
      "3点后",
    ]);
    expect(bedTimeRanges.find((option) => option.value === "21_22")).toMatchObject({
      rangeText: "21:00–22:00",
      estimate: "21:30",
    });
  });

  it("uses one-hour granularity for wake time while keeping open endpoints", () => {
    expect(wakeTimeRanges.map((option) => option.label)).toEqual([
      "6点前",
      "6点",
      "7点",
      "8点",
      "9点",
      "10点",
      "11点",
      "中午后",
    ]);
    expect(wakeTimeRanges.find((option) => option.value === "06_07")).toMatchObject({
      rangeText: "06:00–07:00",
      estimate: "06:30",
    });
  });
});
