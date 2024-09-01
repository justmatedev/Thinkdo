import { StyleSheet, Text, TextInput, View } from "react-native"
import { fontFamily, fontSize } from "../theme/font"
import colors from "../theme/colors"
import { useState } from "react"

const TextInputCustom = ({
  text,
  setText,
  label,
  secure,
  inputMode,
  autoCapitalize,
  forModal,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            fontFamily: forModal
              ? fontFamily.PoppinsSemiBold600
              : fontFamily.PoppinsRegular400,
            marginBottom: forModal ? 10 : 0,
          },
        ]}
      >
        {label}:
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          value={text}
          onChangeText={(text) => setText(text)}
          style={[
            styles.input,
            {
              borderColor: isFocused
                ? colors.primaryPurpleAlfa
                : colors.borderColorLight,
            },
          ]}
          cursorColor={colors.primaryPurpleAlfa}
          selectionColor={colors.primaryPurpleAlfa}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secure}
          inputMode={inputMode ? inputMode : "text"}
          autoCapitalize={autoCapitalize ? autoCapitalize : "sentences"}
        />
      </View>
    </View>
  )
}

export default TextInputCustom

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    fontFamily: fontFamily.PoppinsRegular400,
    paddingHorizontal: 15,
    width: "100%",
    fontSize: fontSize.regular,
    paddingTop: 10,
    paddingBottom: 7,
  },
  label: {
    fontSize: fontSize.regular,
    paddingStart: 5,
  },
})
