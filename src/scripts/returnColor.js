import colors from "../theme/colors"

const returnHexColor = (color) => {
  if (color === "red") {
    return colors.customBackgroundNoteRed
  } else if (color === "orange") {
    return colors.customBackgroundNoteOrange
  } else if (color === "yellow") {
    return colors.customBackgroundNoteYellow
  } else if (color === "green") {
    return colors.customBackgroundNoteGreen
  } else if (color === "blue") {
    return colors.customBackgroundNoteBlue
  } else if (color === "indigo") {
    return colors.customBackgroundNoteIndigo
  } else if (color === "violet") {
    return colors.customBackgroundNoteViolet
  } else if (color === "default") {
    return colors.backgroundLight
  }
}

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

export { returnHexColor, returnNameColor }
