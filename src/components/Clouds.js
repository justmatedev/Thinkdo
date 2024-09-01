import { StyleSheet, View, Dimensions } from "react-native"
import colors from "../theme/colors"
const { width, height } = Dimensions.get("window")

const offsets = [
  { top: 0.015, left: 0.013 },
  { top: 0.01, left: 0.04 },
  { top: 0.009, left: 0.07 },
  { top: 0.011, left: 0.09 },
  { top: 0.008, left: 0.13 },
  { top: 0.01, left: 0.15 },
  { top: 0.008, left: 0.16 },
  { top: 0.012, left: 0.19 },
  { top: 0.008, left: 0.21 },
  { top: 0.011, left: 0.23 },
  { top: 0.013, left: 0.27 },
  { top: 0.01, left: 0.3 },
  { top: 0.012, left: 0.32 },
  { top: 0.013, left: 0.35 },
  { top: 0.01, left: 0.38 },
  { top: 0.015, left: 0.43 },
]

const Clouds = ({ bottom }) => {
  return (
    <View
      style={[
        styles.container,
        { height: bottom ? height * 0.05 : height * 0.07 },
      ]}
    >
      {offsets.map((offset, index) =>
        bottom ? (
          <View
            key={index}
            style={[
              styles.cloud,
              {
                bottom: height * 0.028 + height * offset.top,
                left: -width * offset.left,
                transform: [{ rotate: "180deg" }],
              },
            ]}
          />
        ) : (
          <View
            key={index}
            style={[
              styles.cloud,
              {
                top: height * offset.top,
                left: -width * offset.left,
              },
            ]}
          />
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryPurple,
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  cloud: {
    height: "50%",
    width: width * 0.09,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    backgroundColor: colors.backgroundLight,
  },
})

export default Clouds
