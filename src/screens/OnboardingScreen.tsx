import React, { useRef, useState,useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';



import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome',
    description: 'Discover amazing features.',
    image: require('../../assets/A1.png'),
  },
  {
    id: '2',
    title: 'Stay Connected',
    description: 'Stay in touch with your friends.',
    image: require('../../assets/A2.png'),
  },
  {
    id: '3',
    title: 'Get Started',
    description: 'Let’s get you set up!',
    image: require('../../assets/A3.png'),
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('hasLaunched', 'true');
      navigation.replace('Home');
    }
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };


  return (

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
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: { width: '100%', height: 300, resizeMode: 'contain' },
  title: { fontSize: 24,color: '#fff', fontWeight: 'bold', marginTop: 20 },
  desc: { fontSize: 16, color: '#fff', textAlign: 'center', marginTop: 10 },
  footer: { alignItems: 'center', paddingBottom: 40 },
  dots: { flexDirection: 'row', marginBottom: 20 },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#bbb',
    marginHorizontal: 5,
  },
  activeDot: { backgroundColor: '#333' },
  button: {
  backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 25,
    width: '90%',
    alignItems: 'center',
    marginHorizontal: 20, // Optional: adds space on both sides
  },
  buttonText: { color: '#fff', fontSize: 16 },
});