import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import colors from "../theme/colors";
import { fontFamily, fontSize } from "../theme/font";

const Tags = ({ item, activeTags, onPressFunc }) => {
  if (onPressFunc) {
    return (
      <TouchableOpacity
        style={[
          styles.tag,
          Array.isArray(activeTags) && activeTags.includes(item)
            ? { borderColor: colors.primaryPurple }
            : { borderColor: colors.borderColorLight },
        ]}
        onPress={onPressFunc}
        activeOpacity={onPressFunc ? 0.5 : 1}
      >
        <Text style={styles.txt} numberOfLines={1}>
          #{item}
        </Text>
      </TouchableOpacity>
    );
  }
  return (
    <View
      style={[
        styles.tag,
        Array.isArray(activeTags) && activeTags.includes(item)
          ? { borderColor: colors.primaryPurple }
          : { borderColor: colors.borderColorLight },
      ]}
    >
      <Text style={styles.txt} numberOfLines={1}>
        #{item}
      </Text>
    </View>
  );
};

export default Tags;

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.primaryGreenAlfa,
    padding: 3,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 200,
  },
  txt: {
    fontSize: fontSize.small,
    fontFamily: fontFamily.PoppinsRegular400,
    paddingTop: 3,
  },
});
