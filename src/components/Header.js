import {
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  Platform,
  View,
  Image,
} from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useNavigation } from "@react-navigation/native"
import { useContext, useEffect } from "react"
import { UserContext } from "../context/userContext"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar as StatusBarExpo } from "expo-status-bar"
import colors from "../theme/colors"
import { iconSize, iconSource } from "../theme/icon"
import { fontFamily, fontSize } from "../theme/font"

export default function Header({
  fromHome,
  fromAddEditNote,
  fromSettings,
  settingsTitle,
}) {
  const navigation = useNavigation()
  const { user, statusBarColor, setModalAction } = useContext(UserContext)

  useEffect(() => {
    colorBackground()
  }, [statusBarColor])

  const colorMapping = {
    [colors.customStatusBarModalNoteRed]: colors.customBackgroundNoteRed,
    [colors.customBackgroundNoteRed]: colors.customBackgroundNoteRed,
    [colors.customStatusBarModalNoteOrange]: colors.customBackgroundNoteOrange,
    [colors.customBackgroundNoteOrange]: colors.customBackgroundNoteOrange,
    [colors.customStatusBarModalNoteYellow]: colors.customBackgroundNoteYellow,
    [colors.customBackgroundNoteYellow]: colors.customBackgroundNoteYellow,
    [colors.customStatusBarModalNoteGreen]: colors.customBackgroundNoteGreen,
    [colors.customBackgroundNoteGreen]: colors.customBackgroundNoteGreen,
    [colors.customStatusBarModalNoteBlue]: colors.customBackgroundNoteBlue,
    [colors.customBackgroundNoteBlue]: colors.customBackgroundNoteBlue,
    [colors.customStatusBarModalNoteIndigo]: colors.customBackgroundNoteIndigo,
    [colors.customBackgroundNoteIndigo]: colors.customBackgroundNoteIndigo,
    [colors.customStatusBarModalNoteViolet]: colors.customBackgroundNoteViolet,
    [colors.customBackgroundNoteViolet]: colors.customBackgroundNoteViolet,
    [colors.backgroundLightStatusBarModal]: colors.backgroundLight,
    [colors.backgroundLight]: colors.backgroundLight,
  }

  const colorBackground = () => colorMapping[statusBarColor] || null

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colorBackground() }]}
    >
      <StatusBarExpo backgroundColor={statusBarColor} style="dark" />
      <View style={styles.containerContent}>
        {fromHome && (
          <>
            <View
              style={{
                flexDirection: "row",
                gap: 5,
                alignItems: "center",
                padding: 5,
              }}
            >
              <Image
                style={{ height: 35, width: 64, marginRight: 10 }}
                source={iconSource.logo}
              />
              <Text
                style={{
                  fontSize: fontSize.regular,
                  width: "65%",
                  fontFamily: fontFamily.PoppinsRegular400,
                }}
                numberOfLines={1}
              >
                Hi, {user.displayName}!
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Menu")}>
              <Ionicons
                name="menu-outline"
                size={iconSize.regular}
                color={colors.primaryPurple}
                style={{
                  padding: 5,
                }}
              />
            </TouchableOpacity>
          </>
        )}
        {fromAddEditNote && (
          <>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons
                name="chevron-back-outline"
                size={iconSize.regular}
                color={colors.primaryPurple}
                style={{
                  padding: 5,
                }}
              />
            </TouchableOpacity>
          </>
        )}
        {fromSettings && (
          <>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons
                name="chevron-back"
                size={iconSize.regular}
                color={colors.primaryPurple}
                style={{
                  padding: 5,
                }}
              />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: fontSize.regular,
                fontFamily: fontFamily.PoppinsRegular400,
                padding: 5,
              }}
            >
              {settingsTitle}
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 10,
  },
  containerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
})
