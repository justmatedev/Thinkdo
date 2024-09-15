import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import React, { useContext, useEffect, useState } from "react"
import NoteList from "../components/NoteList"
import { db } from "../firebaseConnection"
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore"
import Header from "../components/Header"
import DraggableFlatList from "react-native-draggable-flatlist"
import { UserContext } from "../context/userContext"
import LoadingScreen from "../components/LoadingScreen"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import CustomModal from "../components/CustomModal"
import colors from "../theme/colors"
import { iconSize } from "../theme/icon"
import { Ionicons } from "@expo/vector-icons"
import { fontFamily, fontSize } from "../theme/font"
import configureNavigationBar from "../scripts/configureNavigationBar"
import CloudButton from "../components/CloudButton"
import ListTags from "../components/ListTags"
import NoNotes from "../components/NoNotes"
import getUnknownErrorFirebase from "../scripts/getUnknownErrorFirebase"
import { returnHexColor } from "../scripts/returnColor"

const Home = () => {
  const navigation = useNavigation()
  const [notes, setNotes] = useState([])
  const [notesSearch, setNotesSearch] = useState([])
  const [searchFilter, setSearchFilter] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [activeTags, setActiveTags] = useState([])
  const [draggingItem, setDraggingItem] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const [forceUpdate, setForceUpdate] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const {
    selectedNotes,
    setSelectedNotes,
    user,
    tags,
    setStatusBarColor,
    setModalAction,
  } = useContext(UserContext)

  useEffect(() => {
    setIsLoading(true)
    const loadDocs = async () => {
      await updateDocs()
      setIsLoading(false)
    }
    loadDocs()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      setForceUpdate((prev) => !prev)
      configureNavigationBar(colors.backgroundLight)
      setStatusBarColor(colors.backgroundLight)

      updateDocs()

      if (activeTags.length !== 0 || searchText !== "") {
        updateDocsFiltered()
      }
    }, [activeTags, searchText, selectedNotes, user])
  )

  const updateDocs = async () => {
    const q = query(
      collection(db, "notes"),
      orderBy("order"),
      where("uid", "==", user.uid)
    )

    const querySnapshot = await getDocs(q)
    const list = []
    querySnapshot.forEach((doc) => {
      list.push({
        id: doc.id,
        backgroundColor: returnHexColor(doc.data().backgroundColor),
        contentText: doc.data().contentText,
        createdAt: doc.data().createdAt,
        lastEditTime: doc.data().lastEditTime,
        order: doc.data().order,
        tags: doc.data().tags,
        title: doc.data().title,
        uid: doc.data().uid,
      })
    })
    setNotes(list)
  }

  const updateDocsFiltered = async () => {
    if (activeTags.length !== 0) {
      const q = query(
        collection(db, "notes"),
        orderBy("order"),
        where("uid", "==", user.uid)
      )
      const querySnapshot = await getDocs(q)
      const list = []
      querySnapshot.forEach((doc) => {
        const tagsFromNote = doc.data().tags
        if (containsAllElements(tagsFromNote, activeTags)) {
          list.push({
            id: doc.id,
            backgroundColor: returnHexColor(doc.data().backgroundColor),
            contentText: doc.data().contentText,
            createdAt: doc.data().createdAt,
            lastEditTime: doc.data().lastEditTime,
            order: doc.data().order,
            tags: doc.data().tags,
            title: doc.data().title,
            uid: doc.data().uid,
          })
        }
      })
      setNotesSearch(list)
    }

    if (searchText !== "") {
      const list = []
      const itemLowerCase = searchText.trim().toLowerCase()

      const q = query(
        collection(db, "notes"),
        orderBy("order"),
        where("uid", "==", user.uid)
      )
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((doc) => {
        const contentTextLowerCase = doc.data().contentText.toLowerCase()
        const titleLowerCase = doc.data().title.toLowerCase()

        if (
          titleLowerCase.includes(itemLowerCase) ||
          contentTextLowerCase.includes(itemLowerCase)
        ) {
          list.push({
            id: doc.id,
            backgroundColor: returnHexColor(doc.data().backgroundColor),
            contentText: doc.data().contentText,
            createdAt: doc.data().createdAt,
            lastEditTime: doc.data().lastEditTime,
            order: doc.data().order,
            tags: doc.data().tags,
            title: doc.data().title,
            uid: doc.data().uid,
          })
        }
      })
      setNotesSearch(list)
    }
  }

  const handleAdjustOrder = async ({ data }) => {
    let needUpdate = false
    for (let i = 0; i < data.length; i++) {
      if (data[i].id !== notes[i].id) {
        needUpdate = true
      }
    }
    if (needUpdate) {
      setNotes(data)
      await Promise.all(
        data.map(async (item, index) => {
          const noteRef = doc(db, "notes", item.id)
          await updateDoc(noteRef, { order: index }).catch((error) => {
            setModalVisible(true)
            getUnknownErrorFirebase(
              "Home",
              "handleAdjustOrder/updateDoc",
              error.code,
              error.message
            )
            setModalAction("UnknownError")
          })
        })
      )
        .then(() => {})
        .catch((error) => {
          setModalVisible(true)
          getUnknownErrorFirebase(
            "Home",
            "handleAdjustOrder/Promise",
            error.code,
            error.message
          )
          setModalAction("UnknownError")
        })
    } else {
      setSelectedNotes([draggingItem])
    }
  }

  const searchNotes = async (fromWhere, item) => {
    setSearchFilter(false)

    if (fromWhere === "tags") {
      let activeTagsList = activeTags
      if (activeTagsList.includes(item)) {
        activeTagsList = activeTagsList.filter((t) => t !== item).sort()
      } else {
        activeTagsList = [...activeTagsList, item].sort()
      }
      setActiveTags(activeTagsList)

      const q = query(
        collection(db, "notes"),
        orderBy("order"),
        where("uid", "==", user.uid)
      )
      const querySnapshot = await getDocs(q)
      const list = []
      querySnapshot.forEach((doc) => {
        const tagsFromNote = doc.data().tags
        if (containsAllElements(tagsFromNote, activeTagsList)) {
          list.push({
            id: doc.id,
            backgroundColor: returnHexColor(doc.data().backgroundColor),
            contentText: doc.data().contentText,
            createdAt: doc.data().createdAt,
            lastEditTime: doc.data().lastEditTime,
            order: doc.data().order,
            tags: doc.data().tags,
            title: doc.data().title,
            uid: doc.data().uid,
          })
        }
      })
      if (activeTagsList.length !== 0) {
        setSearchText("")
        setSearchFilter(true)
        setNotesSearch(list)
      } else {
        setSearchFilter(false)
      }
    }
    if (fromWhere === "input") {
      setSearchText(item)
      if (!item) {
        return
      }
      setActiveTags([])
      setSearchFilter(true)

      const list = []
      const itemLowerCase = searchText.trim().toLowerCase()

      const q = query(
        collection(db, "notes"),
        orderBy("order"),
        where("uid", "==", user.uid)
      )
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((doc) => {
        const contentTextLowerCase = doc.data().contentText.toLowerCase()
        const titleLowerCase = doc.data().title.toLowerCase()

        if (
          titleLowerCase.includes(itemLowerCase) ||
          contentTextLowerCase.includes(itemLowerCase)
        ) {
          list.push({
            id: doc.id,
            backgroundColor: returnHexColor(doc.data().backgroundColor),
            contentText: doc.data().contentText,
            createdAt: doc.data().createdAt,
            lastEditTime: doc.data().lastEditTime,
            order: doc.data().order,
            tags: doc.data().tags,
            title: doc.data().title,
            uid: doc.data().uid,
          })
        }
      })
      setNotesSearch(list)
    }
  }

  function containsAllElements(array1, array2) {
    const set = new Set(array1)
    for (let item of array2) {
      if (!set.has(item)) {
        return false
      }
    }
    return true
  }

  if (isLoading) {
    return <LoadingScreen />
  }
  return (
    <>
      <Header fromHome />
      <View style={styles.container}>
        <View style={styles.containerSearchFilter}>
          {selectedNotes.length !== 0 ? (
            <>
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.borderColorLight,
                    borderRadius: 10,
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontSize.regular,
                      fontFamily: fontFamily.PoppinsRegular400,
                      padding: 10,
                      paddingBottom: 7,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: fontSize.regular,
                        fontFamily: fontFamily.PoppinsSemiBold600,
                      }}
                    >
                      {selectedNotes.length}
                    </Text>
                    {selectedNotes.length == 1
                      ? " selected note"
                      : " selected notes"}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity onPress={() => setSelectedNotes([])}>
                      <Ionicons
                        name="close"
                        size={iconSize.regular}
                        color={colors.buttonRed}
                        style={{ padding: 10 }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setModalAction("DelSelectedNotes")
                        setModalVisible(true)
                      }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={iconSize.regular}
                        color={colors.buttonRed}
                        style={{ padding: 10 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: isFocused
                      ? colors.primaryPurpleAlfa
                      : colors.borderColorLight,
                  },
                ]}
                value={searchText}
                onChangeText={(text) => searchNotes("input", text)}
                placeholder="Search..."
                cursorColor={colors.primaryPurpleAlfa}
                selectionColor={colors.primaryPurpleAlfa}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="none"
              />
              {tags.length !== 0 && (
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <ListTags
                    forceUpdate={forceUpdate}
                    activeTags={activeTags}
                    searchNotes={searchNotes}
                  />
                </View>
              )}
            </>
          )}
        </View>
        {notes.length === 0 ? (
          <NoNotes />
        ) : (
          <DraggableFlatList
            data={searchFilter ? notesSearch : notes}
            keyExtractor={(item) => item.id}
            onDragBegin={(index) => {
              setDraggingItem(searchFilter ? notesSearch[index] : notes[index])
            }}
            onDragEnd={handleAdjustOrder}
            renderItem={({ item, drag }) => (
              <NoteList
                data={item}
                drag={
                  searchFilter || selectedNotes.length !== 0 ? () => {} : drag
                }
              />
            )}
            containerStyle={{
              width: "100%",
              flex: 1,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.favContainer}>
          <CloudButton onPress={() => navigation.navigate("AddEditNote")} />
        </View>

        <CustomModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          selectedNotes={selectedNotes}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: colors.backgroundLight,
  },
  containerSearchFilter: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
    marginBottom: 25,
  },
  favContainer: {
    position: "absolute",
    bottom: 20,
  },

  input: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderColorLight,
    width: "100%",
    fontSize: fontSize.regular,
    fontFamily: fontFamily.PoppinsRegular400,
  },
})

export default Home
