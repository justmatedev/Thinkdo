import Constants from "expo-constants";

export function getAppVersionLabel(): string {
  const version = Constants.expoConfig?.version?.trim();
  return version ? `Thinkdo ${version}` : "Thinkdo";
}
