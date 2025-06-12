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
import SignInScreen from './src/screens/SignInScreen';
import ReactNativeBiometrics from 'react-native-biometrics';
import Colors from './src/constants/colors';

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
  },
};

const App = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [checkingBiometric, setCheckingBiometric] = useState(false);

  useEffect(() => {
    const checkInitialRoute = async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (!hasLaunched) {
        setInitialRoute('Onboarding');
      } else {
        const isAuthed = await AsyncStorage.getItem('isAuthed');
        if (isAuthed === 'true') {
          setCheckingBiometric(true);
          const rnBiometrics = new ReactNativeBiometrics();
          const { available } = await rnBiometrics.isSensorAvailable();
          if (!available) {
            setInitialRoute('Auth');
            setCheckingBiometric(false);
            return;
          }
          rnBiometrics.simplePrompt({ promptMessage: 'Authenticate' })
            .then(resultObject => {
              const { success } = resultObject;
              if (success) {
                setInitialRoute('Home');
              } else {
                setInitialRoute('Auth');
              }
              setCheckingBiometric(false);
            })
            .catch(() => {
              setInitialRoute('Auth');
              setCheckingBiometric(false);
            });
        } else {
          setInitialRoute('Auth');
        }
      }
    };
    checkInitialRoute();
  }, []);

  if (!initialRoute || checkingBiometric) return null; // or a splash/loading screen

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar hidden={true} />
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false, // or true if you want the header
            headerStyle: { backgroundColor: Colors.header }, // Black header
            headerTintColor: Colors.headerText, // White text/icons
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
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;