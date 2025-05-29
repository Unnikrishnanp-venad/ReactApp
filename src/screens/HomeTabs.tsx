import React, { useLayoutEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from './SearchScreen';
import SettingsScreen from './SettingsScreen'; // Add this import
import { useNavigation, useNavigationState } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  const navigation = useNavigation<any>();
  const tabState = useNavigationState(state => state);
  const tabIndex = tabState.index;
  const tabName = tabState.routes[tabIndex].name;

  // useLayoutEffect(() => {
  //   let title = 'Home1';
  //   if (tabName === 'SearchTab') title = 'Search';
  //   navigation.getParent()?.setOptions({ headerTitle: title });
  // }, [navigation, tabName]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let source;
          if (route.name === 'HomeTab') {
            source = require('../../assets/home.png');
          } else if (route.name === 'SearchTab') {
            source = require('../../assets/search.png');
          } else if (route.name === 'SettingsTab') {
            source = require('../../assets/settings.png'); // <-- Add a settings icon in your assets
          }
          return (
            <Image
              source={source}
              style={{ width: 20, height: 20, tintColor: color }}
              resizeMode="contain"
            />
          );
        },
        tabBarShowLabel: false,
        tabBarStyle: { height: 70, backgroundColor: '#000' },
        headerShown: true,
        headerStyle: { backgroundColor: '#0c0d0c' },
        headerTintColor: '#1e90ff',
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home' }} // <-- Set header title here
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ title: 'Search' }} // <-- Set header title here
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ title: 'Settings' }} // <-- Add this tab
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;