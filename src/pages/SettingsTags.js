import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useState } from "react";
import Header from "../components/Header";
import { fontFamily, fontSize } from "../theme/font";
import colors from "../theme/colors";
import { UserContext } from "../context/userContext";
import TagsControl from "../components/TagsControl";
import CustomModal from "../components/CustomModal";
import { Ionicons } from "@expo/vector-icons";
import { iconSize } from "../theme/icon";
import Loading from "../components/Loading";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConnection";
import getUnknownErrorFirebase from "../scripts/getUnknownErrorFirebase";

const SettingsTags = () => {
  const { tags, user, setTags, setModalAction } = useContext(UserContext);
  const [tagName, setTagName] = useState("");
  const [theTagIsEditing, setTheTagIsEditing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeLoading, setActiveLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const addTag = async () => {
    if (tagName) {
      setActiveLoading(true);
      if (tags.includes(tagName)) {
        setActiveLoading(false);
        setModalVisible(true);
        setModalAction("TagAlreadyExist");
        return;
      }
      let list = [...tags, tagName];
      list.sort((a, b) => a.localeCompare(b));

      const docRef = doc(db, "userData", user.uid);
      await updateDoc(docRef, {
        tags: list,
      }).catch((error) => {
        setModalVisible(true);
        getUnknownErrorFirebase(
          "SettingsTags",
          "addTag/updateDoc",
          error.code,
          error.message
        );
        setModalAction("UnknownError");
      });

      setTags(list);
      setTagName("");
      setActiveLoading(false);
    }
  };

  return (
    <>
      <Header fromSettings settingsTitle="Tags" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ alignItems: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.inputView,
            {
              borderColor: isFocused
                ? colors.primaryPurpleAlfa
                : colors.borderColorLight,
            },
          ]}
        >
          <TextInput
            style={styles.input}
            value={tagName}
            onChangeText={(text) => setTagName(text)}
            placeholder="Create a tag..."
            cursorColor={colors.primaryPurpleAlfa}
            selectionColor={colors.primaryPurpleAlfa}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
          />
          {tagName ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  if (!activeLoading) {
                    addTag();
                  }
                }}
              >
                {activeLoading ? (
                  <View style={{ padding: 5 }}>
                    <Loading color={colors.primaryPurple} />
                  </View>
                ) : (
                  <Ionicons
                    name="add-outline"
                    size={iconSize.regular}
                    color={colors.primaryPurple}
                    style={{ padding: 5 }}
                  />
                )}
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        <FlatList
          data={tags}
          renderItem={({ item }) => (
            <TagsControl
              item={item}
              theTagIsEditing={theTagIsEditing}
              setTheTagIsEditing={setTheTagIsEditing}
              setModalVisible={setModalVisible}
            />
          )}
          scrollEnabled={false}
          style={{ marginVertical: 10 }}
        />

        <CustomModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          theTagIsEditing={theTagIsEditing}
          setTheTagIsEditing={setTheTagIsEditing}
        />
      </ScrollView>
    </>
  );
};

export default SettingsTags;

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    fontSize: fontSize.regular,
    fontFamily: fontFamily.PoppinsRegular400,
    height: 35,
    paddingStart: 5,
  },
});
