import { StyleSheet, FlatList, TouchableOpacity } from "react-native"
import React, { useContext } from "react"
import { Ionicons } from "@expo/vector-icons"
import Tags from "./Tags"
import { UserContext } from "../context/userContext"
import { iconSize } from "../theme/icon"
import colors from "../theme/colors"
import { useNavigation } from "@react-navigation/native"

const ListTags = ({ forceUpdate, activeTags, searchNotes, setActiveTags }) => {
  const navigation = useNavigation()
  const { tags } = useContext(UserContext)

  const activeTagsFunction = (tag) => {
    setActiveTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag).sort()
      } else {
        return [...prevTags, tag].sort()
      }
    })
  }
  return (
    <FlatList
      data={tags}
      renderItem={({ item }) => {
        return (
          <Tags
            item={item}
            activeTags={activeTags}
            onPressFunc={() =>
              searchNotes ? searchNotes("tags", item) : activeTagsFunction(item)
            }
          />
        )
      }}
      horizontal
      extraData={forceUpdate}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ alignItems: "center" }}
      ListFooterComponent={
        <TouchableOpacity
          onPress={() => navigation.navigate("SettingsTags")}
          style={styles.footerContainer}
        >
          <Ionicons
            name="add-outline"
            size={iconSize.small}
            color={colors.primaryPurple}
          />
        </TouchableOpacity>
      }
    />
  )
}

export default ListTags

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: colors.primaryGreenAlfa,
    padding: 3,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderColorLight,
  },
})
