import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/userContext";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConnection";
import colors from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { fontFamily, fontSize } from "../theme/font";
import { iconSize } from "../theme/icon";
import Loading from "./Loading";
import getUnknownErrorFirebase from "../scripts/getUnknownErrorFirebase";

const TagsControl = ({
  item,
  theTagIsEditing,
  setTheTagIsEditing,
  setModalVisible,
}) => {
  const { user, tags, setTags, setModalAction } = useContext(UserContext);
  const [tagNameItem, setTagNameItem] = useState(item);
  const [editItem, setEditItem] = useState(false);
  const [activeLoading, setActiveLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (theTagIsEditing === item) {
      setEditItem(true);
    } else {
      setEditItem(false);
    }
    setTagNameItem(item);
  }, [theTagIsEditing, item]);

  const confirmEditing = async (oldTag, newTag) => {
    if (item != tagNameItem) {
      setActiveLoading(true);
      if (tags.includes(tagNameItem)) {
        setActiveLoading(false);
        setModalVisible(true);
        setModalAction("TagAlreadyExist");
        return;
      }

      let list = tags;
      const indexItem = list.indexOf(oldTag);
      if (indexItem !== -1) {
        list[indexItem] = newTag;
      }

      list.sort((a, b) => a.localeCompare(b));
      setTags(list);

      const docRef = doc(db, "userData", user.uid);
      await updateDoc(docRef, {
        tags: list,
      })
        .then(async () => {
          const q = query(
            collection(db, "notes"),
            where("uid", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (document) => {
            let listOldTags = document.data().tags;
            const indexItem = listOldTags.indexOf(oldTag);
            if (indexItem !== -1) {
              listOldTags[indexItem] = newTag;
              listOldTags.sort((a, b) => a.localeCompare(b));

              const noteRef = doc(db, "notes", document.id);
              await updateDoc(noteRef, {
                tags: listOldTags,
              }).catch((error) => {
                getUnknownErrorFirebase(
                  "TagsControl",
                  "confirmEditing/updateDoc/second",
                  error.code,
                  error.message
                );
                setModalVisible(true);
                setModalAction("UnknownError");
              });
            }
          });
        })
        .catch((error) => {
          getUnknownErrorFirebase(
            "TagsControl",
            "confirmEditing/updateDoc/first",
            error.code,
            error.message
          );
          setModalVisible(true);
          setModalAction("UnknownError");
        });

      setActiveLoading(false);
    }

    setTheTagIsEditing(null);
  };

  const delTag = async () => {
    setModalVisible(true);
    setModalAction("DelTag");
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomWidth: theTagIsEditing ? 0 : 1,
        },
      ]}
    >
      {editItem ? (
        <View
          style={[
            styles.input,
            {
              borderColor: isFocused
                ? colors.primaryPurpleAlfa
                : colors.borderColorLight,
            },
          ]}
        >
          <TextInput
            value={tagNameItem}
            onChangeText={(text) => setTagNameItem(text)}
            style={{
              width: "70%",
              fontSize: fontSize.regular,
              fontFamily: fontFamily.PoppinsRegular400,
            }}
            cursorColor={colors.primaryPurpleAlfa}
            selectionColor={colors.primaryPurpleAlfa}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
          />
          <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
            <TouchableOpacity onPress={() => delTag(item)}>
              <Ionicons
                name="trash-outline"
                size={iconSize.regular}
                color="red"
                style={{ padding: 5 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (!activeLoading) {
                  confirmEditing(item, tagNameItem);
                }
              }}
            >
              {activeLoading ? (
                <View style={{ paddingHorizontal: 7 }}>
                  <Loading color={colors.primaryPurple} />
                </View>
              ) : (
                <Ionicons
                  name="checkmark"
                  size={iconSize.regular}
                  color={colors.primaryPurple}
                  style={{ padding: 5 }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingHorizontal: 10,
            paddingStart: 5,
          }}
          onPress={() => {
            setTheTagIsEditing(item);
          }}
        >
          <Text
            style={{
              width: "85%",
              fontSize: fontSize.regular,
              fontFamily: fontFamily.PoppinsRegular400,
            }}
            numberOfLines={1}
          >
            #{tagNameItem}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setTheTagIsEditing(item);
            }}
          >
            <Ionicons
              name="create-outline"
              size={iconSize.regular}
              color={colors.primaryPurple}
              style={{ padding: 5 }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TagsControl;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    height: 70,
    borderRadius: 10,
    borderColor: colors.borderColorLight,
    marginVertical: 10,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    paddingStart: 17.5,
  },
});
