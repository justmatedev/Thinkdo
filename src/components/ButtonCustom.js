import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React from "react"
import { fontFamily, fontSize } from "../theme/font"
import colors from "../theme/colors"
import Loading from "./Loading"

const ButtonCustom = ({
  title,
  background,
  onPressFunc,
  icon,
  active,
  heightBtn,
  txtColor,
  border,
  borderColor,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: background,
          height: heightBtn ? heightBtn : 40,
          borderWidth: border ? 1 : 0,
          borderColor: border ? borderColor : "transparent",
        },
      ]}
      activeOpacity={active ? 1 : 0.5}
      onPress={active ? null : onPressFunc}
    >
      {active ? (
        <View style={{ justifyContent: "center" }}>
          <Loading />
        </View>
      ) : (
        <>
          {icon && icon}
          {title && (
            <Text
              style={[
                styles.txt,
                { color: txtColor ? txtColor : colors.backgroundLight },
              ]}
            >
              {title}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  )
}

export default ButtonCustom

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    width: "100%",
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  txt: {
    textAlign: "center",
    fontSize: fontSize.regular,
    fontFamily: fontFamily.PoppinsMedium500,
    marginTop: 3,
  },
})
