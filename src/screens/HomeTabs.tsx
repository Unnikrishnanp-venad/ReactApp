import React, { useLayoutEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import Colors from '../constants/colors';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from './SearchScreen';
import SettingsScreen from './SettingsScreen'; // Add this import
import HistoryScreen from './HistoryScreen';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { ScreenNames } from '../constants/screenNames';

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
        tabBarIcon: ({ color, focused }) => {
          let source;
          let iconColor = color;
          if (route.name === 'HomeTab') {
            source = require('../../assets/home.png');
          } else if (route.name === 'SearchTab') {
            source = require('../../assets/search.png');
          } else if (route.name === 'HistoryTab') {
            source = require('../../assets/history.png');
          } else if (route.name === 'SettingsTab') {
            source = require('../../assets/settings.png');
          }
          return (
            <Image
              source={source}
              style={{ width: 20, height: 20, tintColor: iconColor }} // smaller icon size
              resizeMode="contain"
            />
          );
        },
        tabBarActiveTintColor: Colors.button, // Set active icon color to yellow
        tabBarInactiveTintColor: Colors.headerText,  // Set inactive icon color to white
        tabBarShowLabel: false,
        tabBarStyle: { height: 70, backgroundColor: '#000' },
        headerShown: false, // Hide the navigation title bar
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: ScreenNames.HOME }} // <-- Set header title here
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ title: ScreenNames.SEARCH }} // <-- Set header title here
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{ title: ScreenNames.HISTORY }} // <-- Add this tab
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ title: ScreenNames.SETTINGS }} // <-- Add this tab
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;