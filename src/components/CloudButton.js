import { StyleSheet, View, TouchableOpacity } from "react-native";
import React from "react";
import { iconSize } from "../theme/icon";
import colors from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

const CloudButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={[styles.dots, { left: -10, top: 65 }]} />
      <View
        style={[
          styles.dots,
          { left: 0, top: 57, width: 12, height: 12, borderRadius: 6 },
        ]}
      />
      <View style={styles.cloud} />
      <View style={[styles.clouds, { left: -11, width: 83 }]} />
      <View style={[styles.clouds, { top: 1, height: 59 }]} />
      <Ionicons
        name="pencil-outline"
        size={iconSize.large}
        color={colors.backgroundLight}
      />
    </TouchableOpacity>
  );
};

export default CloudButton;

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  cloud: {
    width: 70,
    height: 50,
    borderRadius: 20,
    position: "absolute",
    backgroundColor: colors.primaryPurple,
  },
  clouds: {
    width: 35,
    height: 25,
    borderRadius: 20,
    position: "absolute",
    backgroundColor: colors.primaryPurple,
  },
  dots: {
    width: 8,
    height: 8,
    borderRadius: 5,
    position: "absolute",
    backgroundColor: "red",
    backgroundColor: colors.primaryPurple,
  },
});
