"use no memo";

import {
  FlexWidget,
  ImageWidget,
  TextWidget,
} from "react-native-android-widget";
import type { ThemeName } from "../../lib/theme";
import { widgetDeepLink } from "../actions";
import { resolveCaptureWidgetSize } from "./captureWidgetSize";
import { captureWidgetPalette } from "./captureWidgetTheme";

/** Baked tile (chrome + mark). require() so Metro/APK both ship the PNG. */
const TILE_LIGHT = require("../../../assets/images/widget-capture-tile.png");
const TILE_DARK = require("../../../assets/images/widget-capture-tile-dark.png");
const MARK_LIGHT = require("../../../assets/images/widget-capture-mark.png");
const MARK_DARK = require("../../../assets/images/widget-capture-mark-dark.png");

type Props = {
  width?: number;
  height?: number;
  themeName?: ThemeName;
};

function CaptureMark({
  themeName,
  size,
}: {
  themeName: ThemeName;
  size: number;
}) {
  "use no memo";
  return (
    <ImageWidget
      image={themeName === "dark" ? MARK_DARK : MARK_LIGHT}
      imageWidth={size}
      imageHeight={size}
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}

export function CaptureWidget({
  width = 70,
  height = 70,
  themeName = "light",
}: Props) {
  "use no memo";
  const size = resolveCaptureWidgetSize(width, height);
  const palette = captureWidgetPalette(themeName);
  const uri = widgetDeepLink("capture");

  if (size === "compact") {
    // Full-tile bitmap — mark position is baked into the PNG.
    return (
      <ImageWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri }}
        image={themeName === "dark" ? TILE_DARK : TILE_LIGHT}
        imageWidth={width}
        imageHeight={height}
        resizeMode="stretch"
        style={{ width: "match_parent", height: "match_parent" }}
        accessibilityLabel="Thinkdo Anotar"
      />
    );
  }

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri }}
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: palette.background,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: palette.border,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 14,
      }}
      accessibilityLabel="Thinkdo Anotar"
    >
      <CaptureMark themeName={themeName} size={52} />
      <FlexWidget
        style={{
          flexDirection: "column",
          justifyContent: "center",
          marginLeft: 12,
        }}
      >
        <TextWidget
          text="Anotar"
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: palette.text,
          }}
        />
        <TextWidget
          text="Thinkdo · toque para capturar"
          style={{
            fontSize: 11,
            fontWeight: "500",
            color: palette.textMuted,
            marginTop: 2,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
