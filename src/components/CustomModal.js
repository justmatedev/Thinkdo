import { Text, View, Modal, TouchableOpacity, StyleSheet } from "react-native"
import React, { useContext, useEffect, useState } from "react"
import { auth, db } from "../firebaseConnection"
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore"
import { UserContext } from "../context/userContext"
import { useNavigation } from "@react-navigation/native"
import { fontFamily, fontSize } from "../theme/font"
import colors from "../theme/colors"
import configureNavigationBar from "../scripts/configureNavigationBar"
import TextInputCustom from "./TextInputCustom"
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth"
import ButtonCustom from "./ButtonCustom"
import { Ionicons } from "@expo/vector-icons"
import { iconSize } from "../theme/icon"
import getUnknownErrorFirebase from "../scripts/getUnknownErrorFirebase"

const CustomModal = ({
  modalVisible,
  setModalVisible,
  idNote,
  theTagIsEditing,
  setTheTagIsEditing,
  newName,
  newEmail,
  newPassword,
  checkVerifiedEmail,
}) => {
  const navigation = useNavigation()
  const {
    tags,
    setTags,
    user,
    setUser,
    selectedNotes,
    setSelectedNotes,
    statusBarColor,
    setStatusBarColor,
    modalAction,
    setModalAction,
  } = useContext(UserContext)
  const [activeLoading, setActiveLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const colorMapping = {
      [colors.customBackgroundNoteRed]: colors.customStatusBarModalNoteRed,
      [colors.customBackgroundNoteOrange]:
        colors.customStatusBarModalNoteOrange,
      [colors.customBackgroundNoteYellow]:
        colors.customStatusBarModalNoteYellow,
      [colors.customBackgroundNoteGreen]: colors.customStatusBarModalNoteGreen,
      [colors.customBackgroundNoteBlue]: colors.customStatusBarModalNoteBlue,
      [colors.customBackgroundNoteIndigo]:
        colors.customStatusBarModalNoteIndigo,
      [colors.customBackgroundNoteViolet]:
        colors.customStatusBarModalNoteViolet,
      [colors.backgroundLight]: colors.backgroundLightStatusBarModal,
    }

    const reverseColorMapping = {
      [colors.customStatusBarModalNoteRed]: colors.customBackgroundNoteRed,
      [colors.customStatusBarModalNoteOrange]:
        colors.customBackgroundNoteOrange,
      [colors.customStatusBarModalNoteYellow]:
        colors.customBackgroundNoteYellow,
      [colors.customStatusBarModalNoteGreen]: colors.customBackgroundNoteGreen,
      [colors.customStatusBarModalNoteBlue]: colors.customBackgroundNoteBlue,
      [colors.customStatusBarModalNoteIndigo]:
        colors.customBackgroundNoteIndigo,
      [colors.customStatusBarModalNoteViolet]:
        colors.customBackgroundNoteViolet,
      [colors.backgroundLightStatusBarModal]: colors.backgroundLight,
    }

    if (modalVisible) {
      const newColor = colorMapping[statusBarColor] || statusBarColor
      setStatusBarColor(newColor)
      configureNavigationBar(newColor)
    } else {
      const newColor = reverseColorMapping[statusBarColor] || statusBarColor
      setStatusBarColor(newColor)
      configureNavigationBar(newColor)
    }

    if (!modalVisible) {
      setModalAction("")
      setActiveLoading(false)
      setPassword("")
      setEmail("")
      setShowPassword(false)
    }
  }, [modalVisible])

  const delNote = async () => {
    setActiveLoading(true)
    if (selectedNotes.length !== 0) {
      for (let i = 0; i < selectedNotes.length; i++) {
        await deleteDoc(doc(db, "notes", selectedNotes[i].id)).catch(
          (error) => {
            getUnknownErrorFirebase(
              "CustomModal",
              "delNote/deleteDoc",
              error.code,
              error.message
            )
            setModalAction("UnknownError")
            setActiveLoading(false)
            return
          }
        )
      }
      setSelectedNotes([])
    } else {
      await deleteDoc(doc(db, "notes", idNote)).catch((error) => {
        getUnknownErrorFirebase(
          "CustomModal",
          "delNote/deleteDoc",
          error.code,
          error.message
        )
        setModalAction("UnknownError")
        setActiveLoading(false)
        return
      })
      navigation.goBack()
    }
    setModalVisible(false)
    setActiveLoading(false)
  }

  const delTag = async () => {
    setActiveLoading(true)
    const item = theTagIsEditing
    setTags([])
    let list = tags
    const indexItem = list.indexOf(item)
    if (indexItem !== -1) {
      list.splice(indexItem, 1)
    }

    list.sort((a, b) => a.localeCompare(b))
    setTags(list)

    const docRef = doc(db, "userData", user.uid)
    await updateDoc(docRef, {
      tags: list,
    })
      .then(async () => {
        const q = query(collection(db, "notes"))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach(async (document) => {
          if (user.uid === document.data().uid) {
            let listTags = document.data().tags
            const indexItem = listTags.indexOf(item)
            if (indexItem !== -1) {
              listTags.splice(indexItem, 1)
              const ref = doc(db, "notes", document.id)
              await updateDoc(ref, {
                tags: listTags,
              }).catch((error) => {
                getUnknownErrorFirebase(
                  "CustomModal",
                  "delTag/updateDoc/second",
                  error.code,
                  error.message
                )
                setModalAction("UnknownError")
                setActiveLoading(false)
                setTheTagIsEditing(null)
                return
              })
            }
          }
        })
      })
      .catch((error) => {
        getUnknownErrorFirebase(
          "CustomModal",
          "delTag/updateDoc/first",
          error.code,
          error.message
        )
        setModalAction("UnknownError")
        setActiveLoading(false)
        setTheTagIsEditing(null)
        return
      })

    setTheTagIsEditing(null)
    setModalVisible(false)
    setActiveLoading(false)
  }

  const handleLogin = () => {
    if (password) {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      )

      reauthenticateWithCredential(auth.currentUser, credential)
        .then(() => {
          setActiveLoading(true)
          if (modalAction === "ConfirmPassForEmail") {
            updateEmail(auth.currentUser, newEmail)
              .then(async () => {
                const userNow = auth.currentUser
                userNow.reload().then(() => {
                  setUser(userNow)
                })
                checkVerifiedEmail()
                setModalAction("ChangedEmail")
                setActiveLoading(false)
                const docRef = doc(db, "userData", user.uid)
                await updateDoc(docRef, {
                  LastTimeSendVerifiedEmail: null,
                }).catch((error) => {
                  if (error.code === "auth/email-already-in-use") {
                    setModalAction("EmailAlreadyInUse")
                  } else {
                    getUnknownErrorFirebase(
                      "CustomModal",
                      "handleLogin/updateDoc/ChangedEmail",
                      error.code,
                      error.message
                    )
                    setModalAction("UnknownError")
                  }
                })
              })
              .catch((error) => {
                if (error.code === "auth/email-already-in-use") {
                  setModalAction("EmailAlreadyInUse")
                } else {
                  getUnknownErrorFirebase(
                    "CustomModal",
                    "handleLogin/updateEmail/ConfirmPassForEmail",
                    error.code,
                    error.message
                  )
                  setModalAction("UnknownError")
                }
                setActiveLoading(false)
              })
          } else if (modalAction === "ConfirmPassForPassword") {
            updatePassword(user, newPassword)
              .then(() => {
                setModalAction("ChangedPassword")
                setActiveLoading(false)
              })
              .catch((error) => {
                getUnknownErrorFirebase(
                  "CustomModal",
                  "handleLogin/updatePassword/ConfirmPassForPassword",
                  error.code,
                  error.message
                )
                setModalAction("UnknownError")
                setActiveLoading(false)
              })
          } else if (modalAction === "ConfirmPassForName") {
            updateProfile(auth.currentUser, {
              displayName: newName,
            })
              .then(() => {
                setUser(auth.currentUser)
                setModalAction("ChangedName")
                setActiveLoading(false)
              })
              .catch((error) => {
                getUnknownErrorFirebase(
                  "CustomModal",
                  "handleLogin/updateProfile/ConfirmPassForName",
                  error.code,
                  error.message
                )
                setModalAction("UnknownError")
                setActiveLoading(false)
              })
          } else if (modalAction === "ConfirmPassForEmailPassword") {
            updatePassword(auth.currentUser, newPassword).catch((error) => {
              getUnknownErrorFirebase(
                "CustomModal",
                "handleLogin/updatePassword/ConfirmPassForEmailPassword",
                error.code,
                error.message
              )
              setModalAction("UnknownError")
            })

            setTimeout(() => {
              updateEmail(auth.currentUser, newEmail)
                .then(async () => {
                  const userNow = auth.currentUser
                  userNow.reload().then(() => {
                    setUser(userNow)
                  })

                  const docRef = doc(db, "userData", user.uid)
                  await updateDoc(docRef, {
                    LastTimeSendVerifiedEmail: null,
                  }).catch((error) => {
                    getUnknownErrorFirebase(
                      "CustomModal",
                      "handleLogin/updateDoc/ConfirmPassForEmailPassword",
                      error.code,
                      error.message
                    )
                    setModalAction("UnknownError")
                  })
                  checkVerifiedEmail()
                  setActiveLoading(false)
                  setModalAction("ChangedEmailPassword")
                })
                .catch((error) => {
                  if (error.code === "auth/email-already-in-use") {
                    setModalAction("EmailAlreadyInUse")
                  } else {
                    getUnknownErrorFirebase(
                      "CustomModal",
                      "handleLogin/updateEmail/ConfirmPassForEmailPassword",
                      error.code,
                      error.message
                    )
                    setModalAction("UnknownError")
                  }
                  setActiveLoading(false)
                })
            }, 1000)
          } else if (modalAction === "ConfirmPassForEmailPasswordName") {
            updateProfile(auth.currentUser, {
              displayName: newName,
            })
              .then(() => {
                setUser(auth.currentUser)
              })
              .catch((error) => {
                getUnknownErrorFirebase(
                  "CustomModal",
                  "handleLogin/updateProfile/ConfirmPassForEmailPasswordName",
                  error.code,
                  error.message
                )
                setModalAction("UnknownError")
                setActiveLoading(false)
              })
            setTimeout(() => {
              updatePassword(auth.currentUser, newPassword).catch((error) => {
                getUnknownErrorFirebase(
                  "CustomModal",
                  "handleLogin/updatePassword/ConfirmPassForEmailPasswordName",
                  error.code,
                  error.message
                )
                setModalAction("UnknownError")
                setActiveLoading(false)
              })
            }, 1000)

            setTimeout(() => {
              updateEmail(auth.currentUser, newEmail)
                .then(async () => {
                  const userNow = auth.currentUser
                  userNow.reload().then(() => {
                    setUser(userNow)
                  })

                  const docRef = doc(db, "userData", user.uid)
                  await updateDoc(docRef, {
                    LastTimeSendVerifiedEmail: null,
                  }).catch((error) => {
                    getUnknownErrorFirebase(
                      "CustomModal",
                      "handleLogin/updateDoc/ConfirmPassForEmailPasswordName",
                      error.code,
                      error.message
                    )
                    setModalAction("UnknownError")
                  })
                  checkVerifiedEmail()
                  setModalAction("ChangedEmailPasswordName")
                  setActiveLoading(false)
                })
                .catch((error) => {
                  if (error.code === "auth/email-already-in-use") {
                    setModalAction("EmailAlreadyInUse")
                  } else {
                    getUnknownErrorFirebase(
                      "CustomModal",
                      "handleLogin/updateEmail/ConfirmPassForEmailPasswordName",
                      error.code,
                      error.message
                    )
                    setModalAction("UnknownError")
                  }
                  setActiveLoading(false)
                })
            }, 2000)
          } else if (modalAction === "ConfirmPassForEmailName") {
            updateProfile(auth.currentUser, {
              displayName: newName,
            })
              .then(() => {
                setUser(auth.currentUser)
              })
              .catch((error) => {
                getUnknownErrorFirebase(
                  "CustomModal",
                  "handleLogin/updateProfile/ConfirmPassForEmailName",
                  error.code,
                  error.message
                )
                setModalAction("UnknownError")
              })
            setTimeout(() => {
              updateEmail(auth.currentUser, newEmail)
                .then(async () => {
                  const userNow = auth.currentUser
                  userNow.reload().then(() => {
                    setUser(userNow)
                  })
                  checkVerifiedEmail()
                  const docRef = doc(db, "userData", user.uid)
                  await updateDoc(docRef, {
                    LastTimeSendVerifiedEmail: null,
                  })
                    .then(() => {
                      setModalAction("ChangedEmailName")
                      setActiveLoading(false)
                    })
                    .catch((error) => {
                      getUnknownErrorFirebase(
                        "CustomModal",
                        "handleLogin/updateDoc/ConfirmPassForEmailName",
                        error.code,
                        error.message
                      )
                      setModalAction("UnknownError")
                      setActiveLoading(false)
                    })
                })
                .catch((error) => {
                  if (error.code === "auth/email-already-in-use") {
                    setModalAction("EmailAlreadyInUse")
                  } else {
                    getUnknownErrorFirebase(
                      "CustomModal",
                      "handleLogin/updateEmail/ConfirmPassForEmailName",
                      error.code,
                      error.message
                    )
                    setModalAction("UnknownError")
                  }
                  setActiveLoading(false)
                })
            }, 1000)
          } else if (modalAction === "ConfirmPassForPasswordName") {
            updateProfile(auth.currentUser, {
              displayName: newName,
            })
              .then(() => {
                setUser(auth.currentUser)
              })
              .catch((error) => {
                getUnknownErrorFirebase(
                  "CustomModal",
                  "handleLogin/updateProfile/ConfirmPassForPasswordName",
                  error.code,
                  error.message
                )
                setModalAction("UnknownError")
              })

            setTimeout(() => {
              updatePassword(auth.currentUser, newPassword)
                .then(() => {
                  setModalAction("ChangedPasswordName")
                  setActiveLoading(false)
                })
                .catch((error) => {
                  getUnknownErrorFirebase(
                    "CustomModal",
                    "handleLogin/updatePassword/ConfirmPassForPasswordName",
                    error.code,
                    error.message
                  )
                  setModalAction("UnknownError")
                  setActiveLoading(false)
                })
            }, 1000)
          }
        })
        .catch((error) => {
          if (error.code === "auth/wrong-password") {
            setModalAction("WrongPassword")
          } else {
            getUnknownErrorFirebase(
              "CustomModal",
              "handleLogin/reauthenticateWithCredential",
              error.code,
              error.message
            )
            setModalAction("UnknownError")
          }
        })
    }
  }

  const sendResetPassword = () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const checkEmail = re.test(String(email).toLowerCase())
    if (checkEmail) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          setModalAction("SendPasswordReset")
        })
        .catch((error) => {
          if (error.code === "auth/user-not-found") {
            setModalAction("UserNotFound")
          } else {
            getUnknownErrorFirebase(
              "CustomModal",
              "sendResetPassword/sendPasswordResetEmail",
              error.code,
              error.message
            )
            setModalAction("UnknownError")
          }
        })
    } else {
      setModalAction("InvalidEmail")
    }
  }

  const TitleMsg = ({ message }) => {
    return (
      <Text
        style={{
          fontSize: fontSize.regular,
          fontFamily: fontFamily.PoppinsSemiBold600,
        }}
      >
        {message}
      </Text>
    )
  }

  const IconShowPass = () => {
    return (
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
    )
  }

  const ButtonNo = () => {
    return (
      <View style={{ flex: 1 }}>
        <ButtonCustom
          onPressFunc={() => setModalVisible(false)}
          border
          borderColor={colors.primaryPurple}
          title="No"
          txtColor={colors.primaryPurple}
        />
      </View>
    )
  }

  const ShowMessages = () => {
    const eachMessage = {
      DelSelectedNotes: "Do you want to delete the selected notes?",
      DelNote: "Do you want to delete this note?",
      DelTag: "Do you want to delete this tag?",
      ChangedEmail: "Email updated!",
      SendEmail: "Email sent, please confirm it!",
      NeedVerifyEmail: "You need to verify your email before making changes.",
      TooManyRequests:
        "Email already sent, please wait before requesting another.",
      ChangedPassword: "Password updated!",
      InvalidEmail: "Invalid email address.",
      ChangedEmailPassword: "Email and password updated!",
      ShortPassword: "Password is too short.",
      DifferentPassword: "Passwords do not match.",
      ChangedName: "Nickname updated!",
      ChangedEmailPasswordName: "Nickname, email, and password updated!",
      EmptyName: "Nickname cannot be empty.",
      ChangedEmailName: "Nickname and email updated!",
      ChangedPasswordName: "Nickname and password updated!",
      EmailAlreadyInUse: "Email is already in use!",
      RequireAllFields: "Please fill out all fields!",
      UserNotFound: "Email not found.",
      WrongPassword: "Incorrect password.",
      SendPasswordReset: "Password reset email sent.",
      TagAlreadyExist: "Tag already exists.",
      UnknownError: "Unknown error, we are working on a solution.",
    }

    const message = eachMessage[modalAction]

    return message ? <TitleMsg message={message} /> : null
  }

  const PasswordIcon = () => {
    const actionsWithIcon = [
      "ConfirmPassForName",
      "ConfirmPassForEmail",
      "ConfirmPassForPassword",
      "ConfirmPassForEmailPassword",
      "ConfirmPassForEmailPasswordName",
      "ConfirmPassForEmailName",
      "ConfirmPassForPasswordName",
    ]

    return actionsWithIcon.includes(modalAction) ? <IconShowPass /> : null
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible)
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: colors.backgroundColorBackModal,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {
          setModalVisible(!modalVisible)
        }}
        activeOpacity={1}
      >
        <View
          style={{
            backgroundColor: colors.backgroundLight,
            padding: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderColorLight,
            width: "90%",
            maxWidth: 400,
          }}
        >
          <ShowMessages />
          {modalAction === "ConfirmPassForName" && (
            <TextInputCustom
              label="Please confirm your password before changing your nickame"
              text={password}
              setText={setPassword}
              forModal
              secure={!showPassword}
            />
          )}
          {modalAction === "ConfirmPassForEmail" && (
            <TextInputCustom
              label="Please confirm your password before changing your email"
              text={password}
              setText={setPassword}
              forModal
              secure={!showPassword}
            />
          )}
          {modalAction === "ConfirmPassForPassword" && (
            <TextInputCustom
              label="Please confirm your password before changing your password"
              text={password}
              setText={setPassword}
              forModal
              secure={!showPassword}
            />
          )}
          {modalAction === "ConfirmPassForEmailPassword" && (
            <TextInputCustom
              label="Please confirm your password before changing your email and password"
              text={password}
              setText={setPassword}
              forModal
              secure={!showPassword}
            />
          )}
          {modalAction === "ConfirmPassForEmailPasswordName" && (
            <TextInputCustom
              label="Please confirm your password before changing your nickname, email, and password"
              text={password}
              setText={setPassword}
              forModal
              secure={!showPassword}
            />
          )}
          {modalAction === "ConfirmPassForEmailName" && (
            <TextInputCustom
              label="Please confirm your password before changing your name and email"
              text={password}
              setText={setPassword}
              forModal
              secure={!showPassword}
            />
          )}
          {modalAction === "ConfirmPassForPasswordName" && (
            <TextInputCustom
              label="Please confirm your password before changing your nickname and password"
              text={password}
              setText={setPassword}
              forModal
              secure={!showPassword}
            />
          )}
          {modalAction === "ConfirmEmailForSendPasswordReset" && (
            <TextInputCustom
              label="Enter your email to recover your account"
              text={email}
              setText={setEmail}
              forModal
              inputMode="email"
              autoCapitalize="none"
            />
          )}

          <PasswordIcon />
          <View style={styles.buttonContainer}>
            {modalAction === "DelSelectedNotes" && <ButtonNo />}
            {modalAction === "DelNote" && <ButtonNo />}
            {modalAction === "DelTag" && <ButtonNo />}

            <View style={{ flex: 1 }}>
              <ButtonCustom
                onPressFunc={() => {
                  if (
                    modalAction === "DelSelectedNotes" ||
                    modalAction === "DelNote"
                  ) {
                    delNote()
                  } else if (modalAction === "DelTag") {
                    delTag()
                  } else if (
                    modalAction === "ConfirmPassForEmail" ||
                    modalAction === "ConfirmPassForPassword" ||
                    modalAction === "ConfirmPassForEmailPassword" ||
                    modalAction === "ConfirmPassForEmailPasswordName" ||
                    modalAction === "ConfirmPassForEmailName" ||
                    modalAction === "ConfirmPassForPasswordName" ||
                    modalAction === "ConfirmPassForName"
                  ) {
                    handleLogin()
                  } else if (
                    modalAction === "ConfirmEmailForSendPasswordReset"
                  ) {
                    sendResetPassword()
                  } else {
                    setModalVisible(false)
                  }
                }}
                title={
                  modalAction === "DelSelectedNotes" ||
                  modalAction === "DelNote" ||
                  modalAction === "DelTag"
                    ? "Yes"
                    : "Ok"
                }
                background={
                  modalAction === "DelSelectedNotes" ||
                  modalAction === "DelNote" ||
                  modalAction === "DelTag"
                    ? colors.buttonRed
                    : colors.primaryPurple
                }
                active={activeLoading}
                txtColor={colors.backgroundLight}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export default CustomModal

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 20,
  },
})
