import { doc, getDoc } from "firebase/firestore";
import { createContext, useState } from "react";
import { db } from "../firebaseConnection";
import colors from "../theme/colors";

export const UserContext = createContext({});

export default function UserContextProvider({ children }) {
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [user, setUser] = useState({});
  const [tags, setTags] = useState([]);
  const [statusBarColor, setStatusBarColor] = useState(colors.backgroundLight);
  const [modalAction, setModalAction] = useState("");

  const EnterUser = async (userInfo) => {
    setUser(userInfo);

    const docRef = doc(db, "userData", userInfo.uid);
    const docSnap = await getDoc(docRef);

    const list = docSnap.data().tags;
    list.sort((a, b) => a.localeCompare(b));
    setTags(list);
  };

  return (
    <UserContext.Provider
      value={{
        selectedNotes,
        setSelectedNotes,
        user,
        setUser,
        EnterUser,
        tags,
        setTags,
        statusBarColor,
        setStatusBarColor,
        modalAction,
        setModalAction,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
