import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import {
  ScaleDecorator,
  ShadowDecorator,
  OpacityDecorator,
} from "react-native-draggable-flatlist";
import { UserContext } from "../context/userContext";
import { Ionicons } from "@expo/vector-icons";
import Tags from "./Tags";
import { fontFamily, fontSize } from "../theme/font";
import { iconSize } from "../theme/icon";
import colors from "../theme/colors";

const NoteList = ({ data, drag }) => {
  const navigation = useNavigation();
  const { selectedNotes, setSelectedNotes } = useContext(UserContext);
  const [activeSelected, setActiveSelected] = useState(false);

  useEffect(() => {
    const isActiveSelected = selectedNotes.some((note) => note.id === data.id);
    setActiveSelected(isActiveSelected);
  }, [selectedNotes]);

  const formatDateTime = (time) => {
    const receivedTime = moment(time, "YYYY-MM-DD HH:mm:ss");
    const monthName = receivedTime.format("MMM");

    const now = moment();
    if (receivedTime.year() === now.year()) {
      if (receivedTime.day() === now.day()) {
        return receivedTime.format("HH:mm");
      } else {
        return `${receivedTime.date()} ${monthName}`;
      }
    } else {
      return `${receivedTime.day()} ${monthName}, ${receivedTime.year()}`;
    }
  };

  const controlSelectecNotes = () => {
    let hasItem = false;
    for (let i = 0; i < selectedNotes.length; i++) {
      if (selectedNotes[i].id === data.id) {
        hasItem = true;
        break;
      }
    }
    if (hasItem) {
      const updatedNotes = selectedNotes.filter((note) => note.id !== data.id);
      setSelectedNotes(updatedNotes);
    } else {
      setSelectedNotes([...selectedNotes, data]);
    }
  };

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

  return (
    <ScaleDecorator activeScale={0.95}>
      <OpacityDecorator activeOpacity={0.9}>
        <ShadowDecorator>
          <TouchableOpacity
            onLongPress={() => {
              drag();
            }}
            style={[
              styles.container,
              {
                backgroundColor: returnHexColor(data.backgroundColor),
                borderColor: activeSelected
                  ? colors.primaryPurple
                  : colors.borderColorLight,
              },
            ]}
            onPress={() =>
              selectedNotes.length !== 0
                ? controlSelectecNotes()
                : navigation.navigate("AddEditNote", {
                    data: data,
                  })
            }
          >
            <View>
              <Text
                style={{
                  fontSize: fontSize.regular,
                  fontFamily: fontFamily.PoppinsSemiBold600,
                }}
              >
                {data.title}
              </Text>
            </View>

            <View>
              <Text
                numberOfLines={5}
                style={{
                  fontSize: fontSize.regular,
                  fontFamily: fontFamily.PoppinsRegular400,
                  marginVertical: 10,
                }}
              >
                {data.contentText}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 35,
              }}
            >
              <FlatList
                data={data.tags}
                renderItem={({ item }) => {
                  return <Tags item={item} />;
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  marginRight: 10,
                }}
              />

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
                />
                <Text
                  style={{
                    marginStart: 5,
                    fontSize: fontSize.small,
                    fontFamily: fontFamily.PoppinsRegularItalic400,
                    paddingTop: 3,
                  }}
                >
                  {formatDateTime(data.lastEditTime || data.createdAt)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </ShadowDecorator>
      </OpacityDecorator>
    </ScaleDecorator>
  );
};

export default NoteList;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
});
