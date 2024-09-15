import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  Image,
  Linking,
} from "react-native"
import Header from "../components/Header"
import { auth } from "../firebaseConnection"
import { signOut } from "firebase/auth"
import { useNavigation } from "@react-navigation/native"
import colors from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"
import { iconSize, iconSource } from "../theme/icon"
import { fontFamily, fontSize } from "../theme/font"
import CustomModal from "../components/CustomModal"
import { useState } from "react"
import getUnknownErrorFirebase from "../scripts/getUnknownErrorFirebase"

const Menu = () => {
  const navigation = useNavigation()
  const [modalVisible, setModalVisible] = useState(false)

  const handleLogOut = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate("SignIn")
      })
      .catch((error) => {
        setModalVisible(true)
        getUnknownErrorFirebase(
          "Menu",
          "handleLogOut/signOut",
          error.code,
          error.message
        )
        setModalAction("UnknownError")
      })
  }

  const OptionSetting = ({ title, icon, navigate }) => {
    return (
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: colors.borderColorLight,
          marginVertical: 13,
          paddingVertical: 5,
          paddingStart: 5,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            navigate === "logout"
              ? handleLogOut()
              : navigation.navigate(navigate)
          }
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 15,
              paddingBottom: 5,
            }}
          >
            {icon}
            <Text
              style={{
                fontFamily: fontFamily.PoppinsRegular400,
                fontSize: fontSize.regular,
                paddingTop: 4,
              }}
            >
              {title}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  const openGithub = () => {
    const url = "https://github.com/justmatedev/Thinkdo"
    Linking.openURL(url)
  }

  const openEmail = () => {
    const url = "mailto:justmatedev@gmail.com"
    Linking.openURL(url)
  }

  return (
    <>
      <Header fromSettings settingsTitle="Menu" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "100%",
          }}
        >
          <View style={{ alignItems: "center", marginVertical: 40 }}>
            <Image
              style={{ height: 35 * 2.2, width: 64 * 2.2 }}
              source={iconSource.logo}
            />
          </View>

          <OptionSetting
            title="Tags"
            icon={
              <Ionicons
                name="pricetags-outline"
                size={iconSize.regular}
                color={colors.primaryPurple}
              />
            }
            navigate="SettingsTags"
          />
          <OptionSetting
            title="Account Settings"
            icon={
              <Ionicons
                name="person-outline"
                size={iconSize.regular}
                color={colors.primaryPurple}
              />
            }
            navigate="AccountSettings"
          />
          <OptionSetting
            title="Logout"
            icon={
              <Ionicons
                name="log-out-outline"
                size={iconSize.regular}
                color={colors.buttonRed}
              />
            }
            navigate="logout"
          />

          <View style={{ alignItems: "center", marginTop: 20, gap: 5 }}>
            <Text style={[styles.text]}>App Version: 1.0.2</Text>
            <TouchableOpacity
              onPress={openGithub}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 5,
              }}
            >
              <Text
                style={[
                  styles.text,
                  {
                    marginEnd: 5,
                    textDecorationLine: "underline",
                    color: colors.primaryPurple,
                  },
                ]}
              >
                Source Code:
              </Text>
              <Ionicons
                name="logo-github"
                size={iconSize.small}
                color={colors.primaryPurple}
              />
            </TouchableOpacity>

            <Text style={[styles.text, { textAlign: "center" }]}>
              For any questions, errors, or suggestions, please email us at:
            </Text>
            <TouchableOpacity onPress={openEmail}>
              <Text
                style={[
                  styles.text,
                  {
                    color: colors.primaryPurple,
                    textDecorationLine: "underline",
                  },
                ]}
              >
                justmatedev@gmail.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <CustomModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      </ScrollView>
    </>
  )
}

export default Menu

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    padding: 10,
  },
  inputView: {
    marginVertical: 10,
    padding: 10,
    paddingTop: 10,
    paddingBottom: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderColorLight,
  },
  text: {
    fontFamily: fontFamily.PoppinsRegular400,
    fontSize: fontSize.regular,
  },
})
