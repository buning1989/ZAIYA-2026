import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AppMainSurface, { type AppSurfaceMode } from "../AppMainSurface";
import MultiFormShowcase from "../MultiFormShowcase";
import { XIAOCHEN_CURRENT_DATETIME } from "@/apps/experience/data/xiaochen/timeConfig";
import { formatDialogTimeForReference } from "@/lib/dialogTime";
import type { AppMainSurfaceDemoState } from "../demo/types";

const xiaochenReferenceNow = new Date(XIAOCHEN_CURRENT_DATETIME);

function renderDialog(mode: AppSurfaceMode) {
  const demoState: AppMainSurfaceDemoState = {
    enabled: true,
    now: xiaochenReferenceNow,
    surfaceMode: "dialog",
  };

  return renderToStaticMarkup(
    <AppMainSurface
      mode={mode}
      referenceNow={xiaochenReferenceNow}
      interactive
      variant="immersive"
      demoState={demoState}
    />,
  );
}

describe("AppMainSurface runtime mode", () => {
  it("switches from landing preview data to Xiaochen experience data without module-level mode residue", () => {
    const landing = renderDialog("landing-preview");
    const experience = renderDialog("experience");

    expect(landing).toContain("刚刚又有点卡住");
    expect(landing).not.toContain("王医生");
    expect(experience).toContain("王医生");
    expect(experience).toContain("今天 21:30");
    expect(experience).not.toContain("刚刚又有点卡住");
  });

  it("switches from Xiaochen experience data back to landing preview data", () => {
    const experience = renderDialog("experience");
    const landing = renderDialog("landing-preview");

    expect(experience).toContain("王医生");
    expect(landing).toContain("刚刚又有点卡住");
    expect(landing).not.toContain("王医生");
  });

  it("treats July 15 as today and July 14 as yesterday under the experience reference date", () => {
    expect(
      formatDialogTimeForReference(
        new Date("2026-07-15T21:30:00+08:00"),
        xiaochenReferenceNow,
      ),
    ).toBe("今天 21:30");
    expect(
      formatDialogTimeForReference(
        new Date("2026-07-14T21:30:00+08:00"),
        xiaochenReferenceNow,
      ),
    ).toBe("昨天 21:30");
  });

  it("keeps experience mode correct after the landing import chain is loaded first", () => {
    expect(MultiFormShowcase).toBeTypeOf("function");

    const experience = renderDialog("experience");
    expect(experience).toContain("王医生");
    expect(experience).toContain("今天 21:30");
    expect(experience).not.toContain("刚刚又有点卡住");
  });
});
