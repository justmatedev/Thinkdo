import React, { useContext, useEffect, useState } from "react"
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Text,
  Keyboard,
} from "react-native"
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native"
import Header from "../components/Header"
import { db } from "../firebaseConnection"
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore"
import moment from "moment"
import { UserContext } from "../context/userContext"
import CustomModal from "../components/CustomModal"
import { Ionicons } from "@expo/vector-icons"
import colors from "../theme/colors"
import { fontFamily, fontSize } from "../theme/font"
import { iconSize } from "../theme/icon"
import configureNavigationBar from "../scripts/configureNavigationBar"
import ButtonCustom from "../components/ButtonCustom"
import ListTags from "../components/ListTags"
import getUnknownErrorFirebase from "../scripts/getUnknownErrorFirebase"
import Loading from "../components/Loading"

export default function AddEditNote() {
  const navigation = useNavigation()
  const route = useRoute()
  const data = route.params?.data

  const { user, setStatusBarColor, setModalAction } = useContext(UserContext)
  const [title, setTitle] = useState(data ? data.title : "")
  const [content, setContent] = useState(data ? data.contentText : "")
  const [activeTags, setActiveTags] = useState(data ? data.tags : [])
  const [backgroundColorNote, setBackgroundColorNote] = useState(
    data ? data.backgroundColor : colors.backgroundLight
  )
  const [dataMain, setDataMain] = useState({
    id: data ? data.id : null,
    title: data ? data.title : "",
    content: data ? data.contentText : "",
    activeTags: data ? data.tags : [],
    backgroundColorNote: data ? data.backgroundColor : colors.backgroundLight,
  })

  const [modalVisible, setModalVisible] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [activeLoading, setActiveLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [lastEditTime, setLastEditTime] = useState(
    data ? data.lastEditTime : null
  )
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])

  const [undoMade, setUndoMade] = useState(false)
  const [redoMade, setRedoMade] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      configureNavigationBar(dataMain.backgroundColorNote)
      setStatusBarColor(dataMain.backgroundColorNote)
      const unsubscribe = navigation.addListener("beforeRemove", () => {
        return true
      })
      return unsubscribe
    }, [navigation])
  )

  useEffect(() => {
    if (data) {
      setStatusBarColor(data.backgroundColor)
      configureNavigationBar(data.backgroundColor)
    } else {
      setStatusBarColor(colors.backgroundLight)
      configureNavigationBar(colors.backgroundLight)
    }
  }, [])

  useEffect(() => {
    if (hasLoaded) {
      const saveNote = async () => {
        if (dataMain.id) {
          await handleUpdate()
        } else {
          await handleAdd()
        }
      }

      const timeoutId = setTimeout(saveNote, 1500)

      return () => clearTimeout(timeoutId)
    } else {
      setHasLoaded(true)
    }
  }, [title, content, backgroundColorNote, activeTags])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setShowOptions(false)
      }
    )
    return () => {
      keyboardDidShowListener.remove()
    }
  }, [showOptions])

  const returnNameColor = (color) => {
    if (color === colors.customBackgroundNoteRed) {
      return "red"
    } else if (color === colors.customBackgroundNoteOrange) {
      return "orange"
    } else if (color === colors.customBackgroundNoteYellow) {
      return "yellow"
    } else if (color === colors.customBackgroundNoteGreen) {
      return "green"
    } else if (color === colors.customBackgroundNoteBlue) {
      return "blue"
    } else if (color === colors.customBackgroundNoteIndigo) {
      return "indigo"
    } else if (color === colors.customBackgroundNoteViolet) {
      return "violet"
    } else if (color === colors.backgroundLight) {
      return "default"
    }
  }

  const handleAdd = async () => {
    if (
      title !== dataMain.title ||
      content !== dataMain.content ||
      activeTags.toString() !== dataMain.activeTags.toString() ||
      backgroundColorNote !== dataMain.backgroundColorNote
    ) {
      setActiveLoading(true)
      const now = moment().format("YYYY-MM-DD HH:mm:ss")
      let orderChanged = 1

      const q = query(
        collection(db, "notes"),
        orderBy("order"),
        where("uid", "==", user.uid)
      )
      const querySnapshot = await getDocs(q)
      for (let i = 0; i < querySnapshot.docs.length; i++) {
        const item = querySnapshot.docs[i]
        const noteRef = doc(db, "notes", item.id)
        await updateDoc(noteRef, {
          order: orderChanged,
        })
          .then(() => {
            orderChanged += 1
          })
          .catch((error) => {
            getUnknownErrorFirebase(
              "AddEditNote",
              "handleAdd/updateDoc",
              error.code,
              error.message
            )
            setModalAction("UnknownError")
            setModalVisible(true)
          })
      }

      try {
        const docRef = await addDoc(collection(db, "notes"), {
          backgroundColor: returnNameColor(backgroundColorNote),
          contentText: content,
          createdAt: now,
          lastEditTime: now,
          order: 0,
          tags: activeTags,
          title: title,
          uid: user.uid,
        })

        setDataMain({
          id: docRef.id,
          title: title,
          content: content,
          backgroundColorNote: returnNameColor(backgroundColorNote),
          activeTags: activeTags,
        })
        setLastEditTime(now)
      } catch (error) {
        getUnknownErrorFirebase(
          "AddEditNote",
          "handleAdd/addDoc",
          error.code,
          error.message
        )
        setModalAction("UnknownError")
        setModalVisible(true)
      }

      setActiveLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (
      title !== dataMain.title ||
      content !== dataMain.content ||
      activeTags.toString() !== dataMain.activeTags.toString() ||
      backgroundColorNote !== dataMain.backgroundColorNote
    ) {
      setActiveLoading(true)

      const now = moment().format("YYYY-MM-DD HH:mm:ss")

      const noteRef = doc(db, "notes", dataMain.id)
      await updateDoc(noteRef, {
        backgroundColor: returnNameColor(backgroundColorNote),
        contentText: content,
        lastEditTime: now,
        order: 0,
        tags: activeTags,
        title: title,
      })
        .then(async () => {
          if (!undoMade) {
            setUndoStack((prevData) => [...prevData, dataMain.content])
          }
          setDataMain((prevData) => ({
            ...prevData,
            title: title,
            content: content,
            backgroundColorNote: returnNameColor(backgroundColorNote),
            activeTags: activeTags,
          }))
          setLastEditTime(now)
          let orderChanged = 1
          const q = query(
            collection(db, "notes"),
            orderBy("order"),
            where("uid", "==", user.uid)
          )
          const querySnapshot = await getDocs(q)
          for (let i = 0; i < querySnapshot.docs.length; i++) {
            const item = querySnapshot.docs[i]
            if (item.id != dataMain.id) {
              const noteRef = doc(db, "notes", item.id)
              await updateDoc(noteRef, {
                order: orderChanged,
              })
                .then(() => {
                  orderChanged += 1
                })
                .catch((error) => {
                  getUnknownErrorFirebase(
                    "AddEditNote",
                    "handleUpdate/updateDoc/updateDoc/second",
                    error.code,
                    error.message
                  )
                  setModalAction("UnknownError")
                  setModalVisible(true)
                })
            }
          }
        })
        .catch((error) => {
          getUnknownErrorFirebase(
            "AddEditNote",
            "handleUpdate/updateDoc/first",
            error.code,
            error.message
          )
          setModalAction("UnknownError")
          setModalVisible(true)
        })
      setActiveLoading(false)
    }
  }

  const ColorComponent = ({ colorValue, defaultColor }) => {
    const changeColor = () => {
      setBackgroundColorNote(colorValue)
      setStatusBarColor(colorValue)
      configureNavigationBar(colorValue)
    }
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          backgroundColor: colorValue,
          width: 30,
          height: 30,
          borderRadius: 30,
          borderColor:
            backgroundColorNote === colorValue
              ? colors.primaryPurple
              : colors.borderColorLight,
          borderWidth: 1,
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={changeColor}
      >
        {defaultColor && (
          <Ionicons
            name="close-outline"
            size={24}
            color={colors.borderColorLight}
          />
        )}
      </TouchableOpacity>
    )
  }

  const formatDateTime = (time) => {
    const receivedTime = moment(time, "YYYY-MM-DD HH:mm:ss")
    const monthName = receivedTime.format("MMM")

    const now = moment()
    if (receivedTime.year() === now.year()) {
      if (receivedTime.day() === now.day()) {
        return receivedTime.format("HH:mm")
      } else {
        return `${receivedTime.date()} ${monthName}`
      }
    } else {
      return `${receivedTime.day()} ${monthName}, ${receivedTime.year()}`
    }
  }

  const undoStackFunc = () => {
    setUndoMade(true)

    let undoList = undoStack
    setContent(undoList[undoList.length - 1])
    undoList.pop()
    setUndoStack(undoList)
    setRedoStack((prevData) => [...prevData, content])
  }

  const redoStackFunc = () => {
    setRedoMade(true)

    let redoList = redoStack
    setContent(redoList[redoList.length - 1])
    redoList.pop()
    setRedoStack(redoList)
    setUndoStack((prevData) => [...prevData, content])
  }

  return (
    <>
      <Header
        setModalVisible={setModalVisible}
        fromAddEditNote
        canDelete={data ? true : false}
      />
      <View
        style={[
          styles.fullScreen,
          {
            backgroundColor: backgroundColorNote,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              fontSize: fontSize.large,
              fontFamily: fontFamily.PoppinsSemiBold600,
              height: 50,
              marginTop: 10,
            },
          ]}
          placeholder="Title"
          value={title}
          onChangeText={(text) => {
            showOptions && setShowOptions(false)
            setTitle(text)
          }}
          cursorColor={colors.primaryPurpleAlfa}
          selectionColor={colors.primaryPurpleAlfa}
        />
        <TextInput
          style={[
            styles.input,
            {
              flex: 1,
              fontSize: fontSize.regular,
              fontFamily: fontFamily.PoppinsRegular400,
            },
          ]}
          placeholder="Content"
          value={content}
          onChangeText={(text) => {
            showOptions && setShowOptions(false)
            setRedoStack([])
            setRedoMade(false)
            setUndoMade(false)
            setContent(text)
          }}
          textAlignVertical="top"
          multiline
          cursorColor={colors.primaryPurpleAlfa}
          selectionColor={colors.primaryPurpleAlfa}
        />

        {showOptions && (
          <View
            style={{
              gap: 10,
              marginBottom: 10,
              paddingHorizontal: 10,
              backgroundColor: "rgba(255,255,255,0.3)",
              paddingVertical: 10,
              borderRadius: 20,
              marginHorizontal: 10,
              borderColor: colors.borderColorLight,
              borderWidth: 1,
            }}
          >
            <ListTags activeTags={activeTags} setActiveTags={setActiveTags} />
            <ScrollView
              horizontal
              contentContainerStyle={{
                gap: 10,
              }}
              showsVerticalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              <ColorComponent
                colorValue={colors.backgroundLight}
                defaultColor
              />
              <ColorComponent colorValue={colors.customBackgroundNoteRed} />
              <ColorComponent colorValue={colors.customBackgroundNoteOrange} />
              <ColorComponent colorValue={colors.customBackgroundNoteYellow} />
              <ColorComponent colorValue={colors.customBackgroundNoteGreen} />
              <ColorComponent colorValue={colors.customBackgroundNoteBlue} />
              <ColorComponent colorValue={colors.customBackgroundNoteIndigo} />
              <ColorComponent colorValue={colors.customBackgroundNoteViolet} />
            </ScrollView>
            {dataMain.id && (
              <ButtonCustom
                icon={
                  <Ionicons
                    name="trash-outline"
                    size={iconSize.regular}
                    color="red"
                  />
                }
                border
                borderColor="red"
                onPressFunc={() => {
                  setModalAction("DelNote")
                  setModalVisible(true)
                }}
              />
            )}
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss()
            setTimeout(() => {
              setShowOptions(!showOptions)
            }, 100)
          }}
          style={styles.options}
          activeOpacity={1}
        >
          <View
            style={{
              flexDirection: "row",
              height: "100%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                marginRight: 20,
                gap: 10,
              }}
            >
              <TouchableOpacity
                style={styles.undoRedo}
                onPress={() => {
                  undoStack.length !== 0 ? undoStackFunc() : {}
                }}
                activeOpacity={undoStack.length !== 0 ? 0.2 : 1}
              >
                <Ionicons
                  name="arrow-undo-outline"
                  size={iconSize.regular}
                  color={
                    undoStack.length !== 0
                      ? colors.primaryPurple
                      : colors.primaryPurpleAlfa
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.undoRedo}
                onPress={() => {
                  redoStack.length !== 0 ? redoStackFunc() : {}
                }}
                activeOpacity={redoStack.length !== 0 ? 0.2 : 1}
              >
                <Ionicons
                  name="arrow-redo-outline"
                  size={iconSize.regular}
                  color={
                    redoStack.length !== 0
                      ? colors.primaryPurple
                      : colors.primaryPurpleAlfa
                  }
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss()
                setTimeout(() => {
                  setShowOptions(!showOptions)
                }, 100)
              }}
            >
              <Ionicons
                name={
                  showOptions ? "chevron-down-outline" : "chevron-up-outline"
                }
                size={iconSize.regular}
                color={colors.primaryPurple}
              />
            </TouchableOpacity>
          </View>
          {lastEditTime && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="time-outline"
                size={iconSize.small}
                color="black"
                style={{ marginEnd: 5 }}
              />

              {activeLoading ? (
                <Loading color={colors.primaryPurple} />
              ) : (
                <Text
                  style={{
                    fontSize: fontSize.small,
                    fontFamily: fontFamily.PoppinsRegularItalic400,
                    paddingTop: 3,
                  }}
                >
                  {formatDateTime(lastEditTime)}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>

        <CustomModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          idNote={dataMain.id}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  options: {
    flexDirection: "row-reverse",
    width: "100%",
    paddingVertical: 10,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 50,
  },
  input: {
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: colors.borderColorLight,
  },
  tag: {
    width: 35,
    height: 20,
    backgroundColor: "gray",
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
    marginEnd: 20,
    borderWidth: 1,
  },
  button: {
    backgroundColor: colors.primaryPurple,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderColor: colors.borderColorLight,
    borderWidth: 1,
  },
  text: {
    fontFamily: fontFamily.PoppinsRegular400,
    fontSize: fontSize.regular,
  },
  undoRedo: {
    paddingHorizontal: 5,
    justifyContent: "center",
  },
})
