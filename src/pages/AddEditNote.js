import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import Header from "../components/Header";
import { db } from "../firebaseConnection";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import moment from "moment";
import { UserContext } from "../context/userContext";
import CustomModal from "../components/CustomModal";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { fontFamily, fontSize } from "../theme/font";
import { iconSize } from "../theme/icon";
import configureNavigationBar from "../scripts/configureNavigationBar";
import ButtonCustom from "../components/ButtonCustom";
import ListTags from "../components/ListTags";
import getUnknownErrorFirebase from "../scripts/getUnknownErrorFirebase";

export default function AddEditNote() {
  const navigation = useNavigation();
  const route = useRoute();
  const data = route.params?.data;

  const { user, setStatusBarColor } = useContext(UserContext);
  const [title, setTitle] = useState(data ? data.title : "");
  const [content, setContent] = useState(data ? data.contentText : "");
  const [activeTags, setActiveTags] = useState(data ? data.tags : []);
  const [modalVisible, setModalVisible] = useState(false);
  const [backgroundColorNote, setBackgroundColorNote] = useState(
    colors.backgroundLight
  );
  const [showOptions, setShowOptions] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", () => {
        setStatusBarColor(colors.backgroundLight);
        setBackgroundColorNote(colors.backgroundLight);
        return true;
      });

      return unsubscribe;
    }, [navigation])
  );

  useEffect(() => {
    if (data) {
      setBackgroundColorNote(returnHexColor(data.backgroundColor));
      setStatusBarColor(returnHexColor(data.backgroundColor));
      configureNavigationBar(returnHexColor(data.backgroundColor));
    } else {
      setStatusBarColor(colors.backgroundLight);
      configureNavigationBar(colors.backgroundLight);
      setBackgroundColorNote(colors.backgroundLight);
    }
  }, []);

  const returnHexColor = (color) => {
    if (color === "red") {
      return colors.customBackgroundNoteRed;
    } else if (color === "orange") {
      return colors.customBackgroundNoteOrange;
    } else if (color === "yellow") {
      return colors.customBackgroundNoteYellow;
    } else if (color === "green") {
      return colors.customBackgroundNoteGreen;
    } else if (color === "blue") {
      return colors.customBackgroundNoteBlue;
    } else if (color === "indigo") {
      return colors.customBackgroundNoteIndigo;
    } else if (color === "violet") {
      return colors.customBackgroundNoteViolet;
    } else if (color === "default") {
      return colors.backgroundLight;
    }
  };

  const returnNameColor = (color) => {
    if (color === colors.customBackgroundNoteRed) {
      return "red";
    } else if (color === colors.customBackgroundNoteOrange) {
      return "orange";
    } else if (color === colors.customBackgroundNoteYellow) {
      return "yellow";
    } else if (color === colors.customBackgroundNoteGreen) {
      return "green";
    } else if (color === colors.customBackgroundNoteBlue) {
      return "blue";
    } else if (color === colors.customBackgroundNoteIndigo) {
      return "indigo";
    } else if (color === colors.customBackgroundNoteViolet) {
      return "violet";
    } else if (color === colors.backgroundLight) {
      return "default";
    }
  };

  const handleAdd = async () => {
    if (title || content) {
      setActiveLoading(true);
      const now = moment().format("YYYY-MM-DD HH:mm:ss");
      let orderChanged = 1;

      const q = query(
        collection(db, "notes"),
        orderBy("order"),
        where("uid", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      for (let i = 0; i < querySnapshot.docs.length; i++) {
        const item = querySnapshot.docs[i];
        const noteRef = doc(db, "notes", item.id);
        await updateDoc(noteRef, {
          order: orderChanged,
        })
          .then(() => {
            orderChanged += 1;
          })
          .catch((error) => {
            getUnknownErrorFirebase(
              "AddEditNote",
              "handleAdd/updateDoc",
              error.code,
              error.message
            );
            setModalAction("UnknownError");
            setModalVisible(true);
          });
      }

      await addDoc(collection(db, "notes"), {
        backgroundColor: returnNameColor(backgroundColorNote),
        contentText: content,
        createdAt: now,
        lastEditTime: now,
        order: 0,
        tags: activeTags,
        title: title,
        uid: user.uid,
      })
        .then(async () => {
          navigation.goBack();
        })
        .catch((error) => {
          getUnknownErrorFirebase(
            "AddEditNote",
            "handleAdd/addDoc",
            error.code,
            error.message
          );
          setModalAction("UnknownError");
          setModalVisible(true);
        });

      setActiveLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (
      data.backgroundColor !== backgroundColorNote ||
      data.contentText !== content ||
      data.tags !== activeTags ||
      data.title !== title
    ) {
      setActiveLoading(true);

      const now = moment().format("YYYY-MM-DD HH:mm:ss");

      const noteRef = doc(db, "notes", data.id);
      await updateDoc(noteRef, {
        backgroundColor: returnNameColor(backgroundColorNote),
        contentText: content,
        lastEditTime: now,
        order: 0,
        tags: activeTags,
        title: title,
      })
        .then(async () => {
          let orderChanged = 1;
          const q = query(
            collection(db, "notes"),
            orderBy("order"),
            where("uid", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          for (let i = 0; i < querySnapshot.docs.length; i++) {
            const item = querySnapshot.docs[i];
            if (item.id != data.id) {
              const noteRef = doc(db, "notes", item.id);
              await updateDoc(noteRef, {
                order: orderChanged,
              })
                .then(() => {
                  orderChanged += 1;
                })
                .catch((error) => {
                  getUnknownErrorFirebase(
                    "AddEditNote",
                    "handleUpdate/updateDoc/updateDoc/second",
                    error.code,
                    error.message
                  );
                  setModalAction("UnknownError");
                  setModalVisible(true);
                });
            }
          }
          navigation.goBack();
        })
        .catch((error) => {
          getUnknownErrorFirebase(
            "AddEditNote",
            "handleUpdate/updateDoc/first",
            error.code,
            error.message
          );
          setModalAction("UnknownError");
          setModalVisible(true);
        });

      setActiveLoading(false);
    }
  };

  const ColorComponent = ({ colorValue, defaultColor }) => {
    const changeColor = () => {
      setBackgroundColorNote(colorValue);
      setStatusBarColor(colorValue);
      configureNavigationBar(colorValue);
    };
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          backgroundColor: colorValue,
          width: 30,
          height: 30,
          borderRadius: 30,
          borderColor: colors.borderColorLight,
          borderWidth: 1,
          position: "relative",
          overflow: "hidden",
        }}
        onPress={changeColor}
      >
        {defaultColor && (
          <>
            <View
              style={{
                position: "absolute",
                width: 1.1,
                height: "141.4%",
                backgroundColor: colors.borderColorLight,
                transform: [{ rotate: "45deg" }],
                top: -6,
                left: "50%",
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 1.1,
                height: "141.4%",
                backgroundColor: colors.borderColorLight,
                transform: [{ rotate: "-45deg" }],
                top: -6,
                right: "50%",
              }}
            />
          </>
        )}
      </TouchableOpacity>
    );
  };

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
            backgroundColor: backgroundColorNote
              ? backgroundColorNote
              : colors.backgroundLight,
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
            },
          ]}
          placeholder="Title"
          value={title}
          onChangeText={(text) => setTitle(text)}
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
          onChangeText={(text) => setContent(text)}
          textAlignVertical="top"
          multiline
          cursorColor={colors.primaryPurpleAlfa}
          selectionColor={colors.primaryPurpleAlfa}
        />

        <View style={styles.options}>
          {!showOptions && (
            <>
              <TouchableOpacity onPress={() => setShowOptions("tags")}>
                <Ionicons
                  name="pricetags-outline"
                  size={iconSize.regular}
                  color={colors.primaryPurple}
                  style={{
                    padding: 5,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowOptions("colors")}>
                <Ionicons
                  name="color-palette-outline"
                  size={iconSize.regular}
                  color={colors.primaryPurple}
                  style={{
                    padding: 5,
                  }}
                />
              </TouchableOpacity>
            </>
          )}
          {showOptions === "tags" && (
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <TouchableOpacity onPress={() => setShowOptions(null)}>
                <Ionicons
                  name="close-outline"
                  size={iconSize.regular}
                  color={colors.buttonRed}
                  style={{
                    padding: 5,
                  }}
                />
              </TouchableOpacity>
              <ListTags activeTags={activeTags} setActiveTags={setActiveTags} />
            </View>
          )}
          {showOptions === "colors" && (
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <ScrollView
                horizontal
                contentContainerStyle={{ gap: 10 }}
                showsVerticalScrollIndicator={false}
              >
                <ColorComponent
                  colorValue={colors.backgroundLight}
                  defaultColor
                />
                <ColorComponent colorValue={colors.customBackgroundNoteRed} />
                <ColorComponent
                  colorValue={colors.customBackgroundNoteOrange}
                />
                <ColorComponent
                  colorValue={colors.customBackgroundNoteYellow}
                />
                <ColorComponent colorValue={colors.customBackgroundNoteGreen} />
                <ColorComponent colorValue={colors.customBackgroundNoteBlue} />
                <ColorComponent
                  colorValue={colors.customBackgroundNoteIndigo}
                />
                <ColorComponent
                  colorValue={colors.customBackgroundNoteViolet}
                />
              </ScrollView>
              <TouchableOpacity onPress={() => setShowOptions(null)}>
                <Ionicons
                  name="close-outline"
                  size={iconSize.regular}
                  color={colors.buttonRed}
                  style={{
                    padding: 5,
                  }}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ButtonCustom
          title={data ? "Update" : "Add"}
          background={colors.primaryPurple}
          onPressFunc={() => {
            if (!activeLoading) {
              if (data) {
                handleUpdate();
              } else {
                handleAdd();
              }
            }
          }}
          active={activeLoading}
        />

        <CustomModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          idNote={data ? data.id : null}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    padding: 10,
    paddingBottom: 0,
  },
  options: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 10,
    justifyContent: "space-between",
    height: 40,
    alignItems: "center",
  },
  input: {
    marginVertical: 5,
    padding: 10,
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
});
