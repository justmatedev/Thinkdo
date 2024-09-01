import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import React, { useContext, useState } from "react"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { auth } from "../firebaseConnection"
import { signInWithEmailAndPassword } from "firebase/auth"
import { UserContext } from "../context/userContext"
import TextInputCustom from "../components/TextInputCustom"
import ButtonCustom from "../components/ButtonCustom"
import colors from "../theme/colors"
import { iconSize, iconSource } from "../theme/icon"
import { fontFamily, fontSize } from "../theme/font"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import Clouds from "../components/Clouds"
import configureNavigationBar from "../scripts/configureNavigationBar"
import CustomModal from "../components/CustomModal"
import getUnknownErrorFirebase from "../scripts/getUnknownErrorFirebase"

const SignIn = () => {
  const navigation = useNavigation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { EnterUser, setModalAction } = useContext(UserContext)
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      configureNavigationBar(colors.primaryPurple)

      const unsubscribe = navigation.addListener("beforeRemove", () => {
        setModalAction("")
        return true
      })

      return unsubscribe
    }, [])
  )

  const handleLogin = () => {
    if (email && password) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const checkEmail = re.test(String(email).toLowerCase())
      if (checkEmail) {
        setLoadingLogin(true)
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            EnterUser(userCredential.user)
            navigation.navigate("Home")
          })
          .catch((error) => {
            setModalVisible(true)
            if (error.code === "auth/user-not-found") {
              setModalAction("UserNotFound")
            } else if (error.code === "auth/wrong-password") {
              setModalAction("WrongPassword")
            } else if (error.code === "auth/too-many-requests") {
              setModalAction("TooManyRequests")
            } else {
              getUnknownErrorFirebase(
                "SignIn",
                "handleLogin/signInWithEmailAndPassword",
                error.code,
                error.message
              )
              setModalAction("UnknownError")
            }
          })
        setLoadingLogin(false)
      } else {
        setModalAction("InvalidEmail")
        setModalVisible(true)
      }
    }
  }

  const forgotPassword = () => {
    setModalAction("ConfirmEmailForSendPasswordReset")
    setModalVisible(true)
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
        <Clouds />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingVertical: 10,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={{ marginBottom: 50 }}>
              <Image
                style={{ height: 77, width: 140.8 }}
                source={iconSource.logo}
              />
            </View>
            <View style={styles.form}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <TextInputCustom
                  text={email}
                  setText={(text) => setEmail(text)}
                  label="Email"
                  inputMode="email"
                  autoCapitalize="none"
                />

                <TextInputCustom
                  text={password}
                  setText={(text) => setPassword(text)}
                  label="Password"
                  secure={!showPassword}
                  autoCapitalize="none"
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingHorizontal: 5,
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <TouchableOpacity onPress={forgotPassword}>
                    <Text
                      style={[
                        styles.text,
                        {
                          color: colors.primaryPurple,
                          textDecorationLine: "underline",
                        },
                      ]}
                    >
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                  {showPassword ? (
                    <TouchableOpacity
                      onPress={() => setShowPassword(false)}
                      activeOpacity={0.5}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={iconSize.regular}
                        color={colors.primaryPurple}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setShowPassword(true)}>
                      <Ionicons
                        name="eye-off-outline"
                        size={iconSize.regular}
                        color={colors.primaryPurple}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <ButtonCustom
                  title="Login"
                  background={colors.primaryPurple}
                  onPressFunc={handleLogin}
                  active={loadingLogin}
                />
                <View
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <Text style={[styles.text]}>Don't have account? </Text>
                  <TouchableOpacity
                    style={{}}
                    onPress={() => navigation.navigate("SignUp")}
                  >
                    <Text
                      style={[
                        styles.text,
                        {
                          color: colors.primaryPurple,
                          textDecorationLine: "underline",
                        },
                      ]}
                    >
                      Sing up
                    </Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </View>
          </View>
        </ScrollView>
        <CustomModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
        <Clouds bottom />
      </View>
    </>
  )
}

export default SignIn

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  form: {
    width: "95%",
    maxWidth: 500,
    paddingBottom: 10,
  },
  text: {
    fontSize: fontSize.regular,
    fontFamily: fontFamily.PoppinsRegular400,
  },
})
