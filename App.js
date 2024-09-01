import { NavigationContainer } from "@react-navigation/native"
import AppRoutes from "./src/routes/app.routes"
import UserContextProvider from "./src/context/userContext"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useFonts } from "expo-font"

export default function App() {
  const [fontsLoaded] = useFonts({
    PoppinsRegular400: require("./src/fonts/Poppins-Regular.ttf"),
    PoppinsRegularItalic400: require("./src/fonts/Poppins-Italic.ttf"),
    PoppinsMedium500: require("./src/fonts/Poppins-Medium.ttf"),
    PoppinsSemiBold600: require("./src/fonts/Poppins-SemiBold.ttf"),
  })

  if (fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <UserContextProvider>
            <AppRoutes />
          </UserContextProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    )
  }
}
