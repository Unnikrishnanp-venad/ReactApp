import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, FlatList, SafeAreaView, Dimensions } from 'react-native';
import Colors from '../constants/colors';
import { ScreenNames } from '../constants/screenNames';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = [
  {
    key: 'grocery',
    label: 'Grocery',
    icon: require('../../assets/A1.png'),
    color: '#27ae60',
    bg: '#eafbe7',
  },
  {
    key: 'swiggy',
    label: 'Swiggy',
    icon: require('../../assets/A2.png'),
    color: '#ff9800',
    bg: '#fff7e6',
  },
  {
    key: 'water',
    label: 'Water',
    icon: require('../../assets/A3.png'),
    color: '#2196f3',
    bg: '#e3f2fd',
  },
  {
    key: 'medicine',
    label: 'Medicine',
    icon: require('../../assets/A4.png'),
    color: '#9c27b0',
    bg: '#f3e5f5',
  },
];

const CARD_MARGIN = 4;
const CARD_COLUMNS = 2;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - (CARD_MARGIN * (CARD_COLUMNS * 2 + 1))) / CARD_COLUMNS;
const CARD_HEIGHT = CARD_WIDTH; // Fixed height for all cards

const HomeScreen = ({ navigation }: any) => {
  const [totals, setTotals] = React.useState<{ [key: string]: number }>({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      (async () => {
        const stored = await AsyncStorage.getItem('history');
        let data = stored ? JSON.parse(stored) : [];
        const newTotals: { [key: string]: number } = {};
        for (const cat of CATEGORIES) {
          newTotals[cat.key] = data
            .filter((item: any) => item.title && item.title.toLowerCase() === cat.label.toLowerCase())
            .reduce((sum: number, item: any) => sum + (typeof item.amount === 'number' ? item.amount : parseFloat(item.amount)), 0);
        }
        setTotals(newTotals);
      })();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top row: profile */}
      <View style={styles.topRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../../assets/A4.png')} style={styles.flixLogo} />
          <Text style={styles.flixTitle}>FLIX</Text>
        </View>
      </View>
      {/* Floating Plus Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate(ScreenNames.ADD)}
      >
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>
      {/* Title */}
      <Text style={styles.title}>Always be{'\n'}in touch</Text>
      {/* Category tiles */}
      <FlatList
        data={CATEGORIES}
        keyExtractor={item => item.key}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginHorizontal: CARD_MARGIN }}
        renderItem={({ item }) => (
          <View style={[
            styles.planCard,
            {
              backgroundColor: Colors.collectionBackground,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              marginBottom: CARD_MARGIN * 2,
              marginHorizontal: 0,
              padding: 20,
              justifyContent: 'center',
            },
          ]}>
            <View style={styles.planRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                <Text style={[styles.planCarrier, { color: item.color, fontSize: 22 }]}>{item.label}</Text>
              </View>
            </View>
            <View style={styles.planDetailsRow}>

              <Text style={[styles.planPrice, { color: item.color, fontSize: 28 }]}>{(totals[item.key] || 0).toFixed(2)}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
        style={{ marginTop: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // solid black
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 44,
    color: Colors.headerText,
    fontWeight: 'bold',
    marginBottom: 18,
    marginLeft: 20,
    marginTop: 8,
    lineHeight: 48,
  },
  planCard: {
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: Colors.borderColor,
    // width and height are set inline in renderItem for equal sizing
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    resizeMode: 'contain',
  },
  planCarrier: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  planCountry: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  planDetailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  planDetails: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  planValidity: {
    fontSize: 13,
    color: Colors.inputText,
    fontWeight: '500',
  },
  planPrice: {
    fontSize: 28,
    color: '#222',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
  flixLogo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    marginRight: 8,
  },
  flixTitle: {
    fontSize: 28,
    color: Colors.button,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.button,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  fabPlus: {
    color: '#111',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: -2,
  },
});