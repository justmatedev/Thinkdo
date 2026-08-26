import "expo-router/entry";
import { Platform } from "react-native";

if (Platform.OS === "android") {
  const {
    registerWidgetTaskHandler,
    registerWidgetConfigurationScreen,
  } = require("react-native-android-widget");
  const { widgetTaskHandler } = require("./src/widgets/android/taskHandler");
  const {
    WidgetConfigScreen,
  } = require("./src/widgets/android/WidgetConfigScreen");
  registerWidgetTaskHandler(widgetTaskHandler);
  registerWidgetConfigurationScreen(WidgetConfigScreen);
}
