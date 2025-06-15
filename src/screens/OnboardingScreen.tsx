import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { StackActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';
import { StorageKeys } from '../constants/storageKeys';
import { ScreenNames } from '../constants/screenNames';
import FontSize from '../constants/fontsize';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Track Every Penny',
    description: 'Stay in control of your finances by logging every income and expense effortlessly. Your budget starts here.',
    image: require('../../assets/A1.png'),
  },
  {
    id: '2',
    title: 'Visualize Your Spending',
    description: 'See where your money goes with easy-to-understand charts and insights. Make informed decisions in seconds.',
    image: require('../../assets/A2.png'),
  },
  {
    id: '3',
    title: 'Smarter Savings Ahead',
    description: 'Set goals, reduce waste, and grow your savings. Your future self will thank you.',
    image: require('../../assets/A3.png'),
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem(StorageKeys.HAS_LAUNCHED, 'true');
      navigation.dispatch(StackActions.push(ScreenNames.AUTH));
    }
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets?.top, paddingBottom: insets?.bottom }}>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>
            </View>
          )}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentIndex === index && styles.activeDot]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: 'center',
    backgroundColor: Colors.background, // solid black
  },
  slide: {
    width: width , // Subtract horizontal padding (24*2) to match container
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: { width: '100%', height: 300, resizeMode: 'contain' },
  title: { fontSize: FontSize.huge, color: Colors.primaryText, fontWeight: 'bold', marginTop: 20 },
  desc: { fontSize: FontSize.large, color: Colors.subtitle, textAlign: 'center', marginTop: 10 ,fontWeight: 'ultralight'},
  footer: { alignItems: 'center', paddingBottom: 40 },
  dots: { flexDirection: 'row', marginBottom: 20 },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.inactiveDot,
    marginHorizontal: 5,
  },
  activeDot: { backgroundColor: Colors.primary },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    height: 50,
    width: width * 0.9, // Make button width responsive to screen size
    alignItems: 'center',
    marginHorizontal: 20, // Optional: adds space on both sides
  },
  buttonText: { color: Colors.primaryText, fontSize: FontSize.xlarge, fontWeight: 'thin' },
});

