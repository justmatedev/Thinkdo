import { addDoc, collection } from "firebase/firestore"
import { db } from "../firebaseConnection"
import moment from "moment"

const getUnknownErrorFirebase = async (screen, func, code, message) => {
  const now = moment().format("YYYY-MM-DD HH:mm:ss")
  await addDoc(collection(db, "errors"), {
    screen: screen,
    func: func,
    code: code,
    message: message,
    date: now,
  })
}

export default getUnknownErrorFirebase
