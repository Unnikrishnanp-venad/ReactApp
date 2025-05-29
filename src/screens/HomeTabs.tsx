import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from './SearchScreen';

const Tab = createBottomTabNavigator();

const HomeTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color }) => {
        let source;
        if (route.name === 'HomeTab') {
          source = require('../../assets/home.png');
        } else if (route.name === 'SearchTab') {
          source = require('../../assets/search.png');
        }
        return (
          <Image
            source={source}
            style={{ width: 20, height: 20, tintColor: color }} // Set your desired size here
            resizeMode="contain"
          />
        );
      },
      tabBarShowLabel: false,
      tabBarStyle: { height: 70 }, // <-- Increase tab bar height here
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeScreen} />
    <Tab.Screen name="SearchTab" component={SearchScreen} />
  </Tab.Navigator>
);

export default HomeTabs;