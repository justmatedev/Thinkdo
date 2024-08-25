import * as NavigationBar from "expo-navigation-bar";

async function configureNavigationBar(color) {
  try {
    await NavigationBar.setBackgroundColorAsync(color);
    await NavigationBar.setButtonStyleAsync("light");
  } catch (error) {
    console.error("Failed to configure navigation bar:", error);
  }
}

export default configureNavigationBar;
