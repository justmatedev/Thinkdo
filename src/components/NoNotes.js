import { Text, View } from "react-native";
import React from "react";
import colors from "../theme/colors";
import { fontFamily, fontSize } from "../theme/font";

const NoNotes = () => {
  return (
    <View style={{ alignItems: "center", gap: 40, marginTop: 50 }}>
      <Text
        style={{
          fontFamily: fontFamily.PoppinsRegular400,
          fontSize: fontSize.regular,
        }}
      >
        Create your first note
      </Text>
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: colors.primaryPurple,
        }}
      />
      <View
        style={{
          width: 25,
          height: 25,
          borderRadius: 12.5,
          backgroundColor: colors.primaryPurple,
        }}
      />
      <View
        style={{
          width: 12.5,
          height: 12.5,
          borderRadius: 6.25,
          backgroundColor: colors.primaryPurple,
        }}
      />
    </View>
  );
};

export default NoNotes;
