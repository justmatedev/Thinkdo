import { resolveCaptureWidgetSize } from "../captureWidgetSize";

describe("resolveCaptureWidgetSize", () => {
  it("treats true 1×1 cells as compact (including tall ~82×100)", () => {
    expect(resolveCaptureWidgetSize(40, 40)).toBe("compact");
    expect(resolveCaptureWidgetSize(70, 70)).toBe("compact");
    expect(resolveCaptureWidgetSize(82, 100)).toBe("compact");
    expect(resolveCaptureWidgetSize(100, 100)).toBe("compact");
    expect(resolveCaptureWidgetSize(70, 85)).toBe("compact");
  });

  it("treats larger cells as wide", () => {
    expect(resolveCaptureWidgetSize(120, 120)).toBe("wide");
    expect(resolveCaptureWidgetSize(150, 140)).toBe("wide");
    expect(resolveCaptureWidgetSize(210, 140)).toBe("wide");
    expect(resolveCaptureWidgetSize(250, 70)).toBe("wide");
    expect(resolveCaptureWidgetSize(276, 100)).toBe("wide");
  });
});
