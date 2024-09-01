import { ActivityIndicator, View } from "react-native"
import React from "react"
import colors from "../theme/colors"

const LoadingScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.backgroundLight,
      }}
    >
      <ActivityIndicator size="large" color={colors.primaryPurple} />
    </View>
  )
}

export default LoadingScreen
