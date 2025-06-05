// App.tsx
import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './src/screens/AuthScreen';
import HomeTabs from './src/screens/HomeTabs';
import OnboardingScreen from './src/screens/OnboardingScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import RNBootSplash from 'react-native-bootsplash';

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#1e90ff', // match your splash color
  },
};

const App = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthed = await AsyncStorage.getItem('isAuthed');
      setInitialRoute(isAuthed === 'true' ? 'Home' : 'Auth');
    };
    checkAuth();
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      RNBootSplash.hide({ fade: true });
      console.log("BootSplash has been hidden successfully");
    });
  }, []);

  if (!initialRoute) return null; // or a splash/loading screen

  return (
    <View style={{ flex: 1, backgroundColor: '#1e90ff' }}>
      <StatusBar hidden={true} />
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false, // or true if you want the header
            headerStyle: { backgroundColor: '#000' }, // Black header
            headerTintColor: '#fff', // White text/icons
          }}
          initialRouteName={initialRoute}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen
            name="Home"
            component={HomeTabs}
            options={{
              headerShown: false, // <-- Hide header for Home only
            }}
          />
          <Stack.Screen
            name="Registration"
            component={RegistrationScreen}
            options={{ headerShown: true, title: 'Registration' }} // Show header and set title
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;