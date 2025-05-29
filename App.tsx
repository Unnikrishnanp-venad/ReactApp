// App.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import HomeTabs from './src/screens/HomeTabs';

const Stack = createNativeStackNavigator();

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      setShowOnboarding(hasLaunched === null);
    };
    checkFirstLaunch();
  }, []);

  if (showOnboarding === null) return null;

  return (
    <>
     <StatusBar hidden={true} />
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // or true if you want the header
          headerStyle: { backgroundColor: '#000' }, // Black header
          headerTintColor: '#fff', // White text/icons
        }}
        initialRouteName={showOnboarding ? 'Onboarding' : 'Auth'}
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
    </>
  );
};

export default App;