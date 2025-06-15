// App.tsx
import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './src/screens/AuthScreen';
import HomeTabs from './src/screens/HomeTabs';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SignInScreen from './src/screens/SignInScreen';
import AddexpenseScreen from './src/screens/AddexpenseScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import ReactNativeBiometrics from 'react-native-biometrics';
import Colors from './src/constants/colors';
import { StorageKeys } from './src/constants/key';
import { ScreenNames } from './src/constants/screenNames';
import Toast from 'react-native-toast-message';

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
      const hasLaunched = await AsyncStorage.getItem(StorageKeys.HAS_LAUNCHED);
      if (!hasLaunched) {
        setInitialRoute(ScreenNames.ONBOARDING);
      } else {
        const isAuthed = await AsyncStorage.getItem(StorageKeys.IS_AUTHED);
        if (isAuthed === 'true') {
          setCheckingBiometric(true);
          const rnBiometrics = new ReactNativeBiometrics();
          const { available } = await rnBiometrics.isSensorAvailable();
          if (!available) {
            setInitialRoute(ScreenNames.AUTH);
            setCheckingBiometric(false);
            return;
          }
          rnBiometrics.simplePrompt({ promptMessage: 'Authenticate' })
            .then(resultObject => {
              const { success } = resultObject;
              if (success) {
                setInitialRoute(ScreenNames.HOME_TABS);
              } else {
                setInitialRoute(ScreenNames.AUTH);
              }
              setCheckingBiometric(false);
            })
            .catch(() => {
              setInitialRoute(ScreenNames.AUTH);
              setCheckingBiometric(false);
            });
        } else {
          setInitialRoute(ScreenNames.AUTH);
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
            headerTintColor: Colors.primaryText, // White text/icons
          }}
          initialRouteName={initialRoute}
        >
          <Stack.Screen name={ScreenNames.ONBOARDING} component={OnboardingScreen} />
          <Stack.Screen name={ScreenNames.AUTH} component={RegistrationScreen} />
          <Stack.Screen
            name={ScreenNames.HOME_TABS}
            component={HomeTabs}
            options={{
              headerShown: false, // <-- Hide header for HomeTabs only
            }}
          />
          <Stack.Screen name={ScreenNames.SIGN_IN} component={SignInScreen} options={{ title: 'Sign In' }} />
          <Stack.Screen name={ScreenNames.ADDEXPENSE} component={AddexpenseScreen} options={{ title: 'Add Expense' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </View>
  );
};

export default App;