import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../pages/Home";
import AddEditNote from "../pages/AddEditNote";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConnection";
import LoadingScreen from "../components/LoadingScreen";
import { UserContext } from "../context/userContext";
import Settings from "../pages/Settings";
import colors from "../theme/colors";
import configureNavigationBar from "../scripts/configureNavigationBar";
import AccountSettings from "../pages/AccountSettings";
import SettingsTags from "../pages/SettingsTags";

const Stack = createNativeStackNavigator();

const AppRoutes = () => {
  const [userAuth, setUserAuth] = useState(null);
  const { EnterUser } = useContext(UserContext);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        EnterUser(user);
        setUserAuth(true);
      } else {
        setUserAuth(false);
      }
    });

    configureNavigationBar(colors.backgroundLight);

    return () => unsub();
  }, []);

  if (userAuth === null) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        animation: "fade_from_bottom",
        headerShown: false,
      }}
      initialRouteName={userAuth ? "Home" : "SignIn"}
    >
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="AddEditNote" component={AddEditNote} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="SettingsTags" component={SettingsTags} />
      <Stack.Screen name="AccountSettings" component={AccountSettings} />
    </Stack.Navigator>
  );
};

export default AppRoutes;
