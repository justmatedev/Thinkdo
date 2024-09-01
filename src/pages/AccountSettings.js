import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import React, { useContext, useState } from "react"
import Header from "../components/Header"
import colors from "../theme/colors"
import TextInputCustom from "../components/TextInputCustom"
import { UserContext } from "../context/userContext"
import { Ionicons } from "@expo/vector-icons"
import { iconSize } from "../theme/icon"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { sendEmailVerification } from "firebase/auth"
import { auth, db } from "../firebaseConnection"
import CustomModal from "../components/CustomModal"
import moment from "moment"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import ButtonCustom from "../components/ButtonCustom"
import getUnknownErrorFirebase from "../scripts/getUnknownErrorFirebase"

const AccountSettings = () => {
  const { user, setUser, setModalAction } = useContext(UserContext)
  const navigation = useNavigation()
  const [name, setName] = useState(user.displayName)
  const [email, setEmail] = useState(user.email)
  const [password, setPassowrd] = useState("")
  const [confirmPassword, setConfirmPassowrd] = useState("")
  const [verifiedEmail, setVerifiedEmail] = useState(user.emailVerified)
  const [modalVisible, setModalVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", () => {
        setModalAction("")
        return true
      })

      return unsubscribe
    }, [])
  )

  const profileUpdate = () => {
    if (name !== user.displayName || email !== user.email || password !== "") {
      if (user.emailVerified) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const checkEmail = re.test(String(email).toLowerCase())

        if (
          name !== user.displayName &&
          email !== user.email &&
          password !== ""
        ) {
          if (name !== "") {
            if (checkEmail) {
              if (password.length > 5) {
                if (password === confirmPassword) {
                  setModalAction("ConfirmPassForEmailPasswordName")
                  setModalVisible(true)
                } else {
                  setModalAction("DifferentPassword")
                  setModalVisible(true)
                }
              } else {
                setModalAction("ShortPassword")
                setModalVisible(true)
              }
            } else {
              setModalAction("InvalidEmail")
              setModalVisible(true)
            }
          } else {
            setModalAction("EmptyName")
            setModalVisible(true)
          }
        } else if (name !== user.displayName && email !== user.email) {
          if (name !== "") {
            if (checkEmail) {
              setModalAction("ConfirmPassForEmailName")
              setModalVisible(true)
            } else {
              setModalAction("InvalidEmail")
              setModalVisible(true)
            }
          } else {
            setModalAction("EmptyName")
            setModalVisible(true)
          }
        } else if (name !== user.displayName && password !== "") {
          if (name !== "") {
            if (password.length > 5) {
              if (password === confirmPassword) {
                setModalAction("ConfirmPassForPasswordName")
                setModalVisible(true)
              } else {
                setModalAction("DifferentPassword")
                setModalVisible(true)
              }
            } else {
              setModalAction("ShortPassword")
              setModalVisible(true)
            }
          } else {
            setModalAction("EmptyName")
            setModalVisible(true)
          }
        } else if (email !== user.email && password !== "") {
          if (checkEmail) {
            if (password.length > 5) {
              if (password === confirmPassword) {
                setModalAction("ConfirmPassForEmailPassword")
                setModalVisible(true)
              } else {
                setModalAction("DifferentPassword")
                setModalVisible(true)
              }
            } else {
              setModalAction("ShortPassword")
              setModalVisible(true)
            }
          } else {
            setModalAction("InvalidEmail")
            setModalVisible(true)
          }
        } else if (email !== user.email) {
          if (checkEmail) {
            setModalAction("ConfirmPassForEmail")
            setModalVisible(true)
          } else {
            setModalAction("InvalidEmail")
            setModalVisible(true)
          }
        } else if (password !== "") {
          if (password.length > 5) {
            if (password === confirmPassword) {
              setModalAction("ConfirmPassForPassword")
              setModalVisible(true)
            } else {
              setModalAction("DifferentPassword")
              setModalVisible(true)
            }
          } else {
            setModalAction("ShortPassword")
            setModalVisible(true)
          }
        } else if (name !== user.displayName) {
          if (name !== "") {
            setModalAction("ConfirmPassForName")
            setModalVisible(true)
          } else {
            setModalAction("EmptyName")
            setModalVisible(true)
          }
        }
      } else {
        setModalAction("NeedVerifyEmail")
        setModalVisible(true)
      }
    }
  }

  const sendVerifiedEmail = async () => {
    const docRef = doc(db, "userData", user.uid)
    const docSnap = await getDoc(docRef)
    const lastDate = docSnap.data().LastTimeSendVerifiedEmail
    const lastDateMoment = moment(lastDate, "YYYY-MM-DD HH:mm:ss")
    const now = moment()

    const lastDatePlus = lastDateMoment.add(1, "minutes")

    if (now.isAfter(lastDatePlus) || !lastDate) {
      sendEmailVerification(auth.currentUser)
        .then(async () => {
          setModalAction("SendEmail")
          setModalVisible(true)
          const nowDate = moment().format("YYYY-MM-DD HH:mm:ss")
          const docRef = doc(db, "userData", user.uid)
          await updateDoc(docRef, {
            LastTimeSendVerifiedEmail: nowDate,
          })
        })
        .catch((error) => {
          setModalVisible(true)
          getUnknownErrorFirebase(
            "AccountSettings",
            "sendVerifiedEmail/sendEmailVerification",
            error.code,
            error.message
          )
          setModalAction("UnknownError")
        })
    } else {
      setModalAction("TooManyRequests")
      setModalVisible(true)
    }
  }

  const checkVerifiedEmail = () => {
    const userNow = auth.currentUser
    userNow.reload().then(() => {
      if (userNow.emailVerified) {
        setUser(userNow)
        setVerifiedEmail(true)
      } else {
        setVerifiedEmail(false)
      }
    })
  }

  return (
    <>
      <Header fromSettings settingsTitle="Account" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ alignItems: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TextInputCustom
              text={name}
              setText={setName}
              label="Nickname"
              autoCapitalize="none"
            />

            <TextInputCustom
              text={email}
              setText={setEmail}
              label="Email"
              inputMode="email"
              autoCapitalize="none"
            />
            {!verifiedEmail && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: "80%" }}>
                  <ButtonCustom
                    title="Verify email"
                    onPressFunc={sendVerifiedEmail}
                    txtColor={colors.primaryPurple}
                    border
                    borderColor={colors.primaryPurple}
                  />
                </View>
                <View style={{ width: "15%" }}>
                  <ButtonCustom
                    onPressFunc={checkVerifiedEmail}
                    txtColor={colors.primaryPurple}
                    border
                    borderColor={colors.primaryPurple}
                    icon={
                      <Ionicons
                        name="refresh"
                        size={iconSize.regular}
                        color={colors.primaryPurple}
                      />
                    }
                  />
                </View>
              </View>
            )}

            <TextInputCustom
              text={password}
              setText={setPassowrd}
              label="Password"
              autoCapitalize="none"
              secure={!showPassword}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingHorizontal: 5,
                alignItems: "center",
              }}
            >
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
            <TextInputCustom
              text={confirmPassword}
              setText={setConfirmPassowrd}
              label="Confirm Password"
              autoCapitalize="none"
              secure={!showConfirmPassword}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingHorizontal: 5,
                alignItems: "center",
              }}
            >
              {showConfirmPassword ? (
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(false)}
                  activeOpacity={0.5}
                >
                  <Ionicons
                    name="eye-outline"
                    size={iconSize.regular}
                    color={colors.primaryPurple}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setShowConfirmPassword(true)}>
                  <Ionicons
                    name="eye-off-outline"
                    size={iconSize.regular}
                    color={colors.primaryPurple}
                  />
                </TouchableOpacity>
              )}
            </View>

            <ButtonCustom
              title="Confirm"
              onPressFunc={profileUpdate}
              background={colors.primaryPurple}
            />
          </KeyboardAvoidingView>
        </View>

        <CustomModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          newEmail={email}
          newPassword={password}
          newName={name}
          checkVerifiedEmail={checkVerifiedEmail}
        />
      </ScrollView>
    </>
  )
}

export default AccountSettings

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
  },
  form: {
    width: "95%",
    maxWidth: 500,
    paddingBottom: 10,
  },
})
