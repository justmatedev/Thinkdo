export type CaptureWidgetSize = "compact" | "wide";

/**
 * Pick layout from widget RemoteViews size (dp from Android).
 * Compact ≈ 1×1; everything larger uses the wide row layout (3×1, 3×2, 2×2, …).
 *
 * Launchers often report 1×1 as ~70–100dp on the long edge (e.g. 82×100).
 * Using `< 100` wrongly classified those as wide, left-aligning the mark.
 */
export function resolveCaptureWidgetSize(
  width: number,
  height: number
): CaptureWidgetSize {
  // True 1×1: both edges under the 2×1 / 1×2 break. Short wide strips
  // (e.g. 250×70) stay wide because max edge is large.
  if (Math.max(width, height) < 120) return "compact";
  return "wide";
}
