import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, FlatList, SafeAreaView, Dimensions } from 'react-native';
import Colors from '../constants/colors';
import { ScreenNames } from '../constants/screenNames';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../constants/key';
import { CATEGORY_META, ExpenseItem } from '../constants/model';
import { StackActions } from '@react-navigation/native';
import FontSize from '../constants/fontsize';



const CARD_MARGIN = 4;
const CARD_COLUMNS = 2;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CARD_WIDTH = SCREEN_WIDTH * 0.45; // set your desired width
const CARD_HEIGHT = SCREEN_WIDTH * 0.45; // set your desired height

const HomeScreen = ({ navigation }: any) => {
  const [categoryTotals, setCategoryTotals] = React.useState<{ [key: string]: number }>({});
  const [categories, setCategories] = React.useState<string[]>([]);
  const [sortDesc, setSortDesc] = React.useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      (async () => {
        const userEmail = await AsyncStorage.getItem(StorageKeys.GOOGLE_USER_EMAIL);
        const stored = await AsyncStorage.getItem(StorageKeys.STORAGE_KEY);
        let data: ExpenseItem[] = stored ? JSON.parse(stored) : [];
        // Only use expenses for the logged-in user
        if (userEmail) {
          data = data.filter(item => item.user === userEmail);
        }
        const uniqueTypes = Array.from(new Set(data.map(item => item.type)));
        setCategories(uniqueTypes);
        const totals: { [key: string]: number } = {};
        for (const type of uniqueTypes) {
          totals[type] = data
            .filter(item => item.type === type)
            .reduce((sum, item) => sum + (typeof item.amount === 'number' ? item.amount : parseFloat(item.amount as any)), 0);
        }
        setCategoryTotals(totals);
      })();
    });
    return unsubscribe;
  }, [navigation]);

  const sortedCategories = [...categories].sort((a, b) => {
    const aTotal = categoryTotals[a] || 0;
    const bTotal = categoryTotals[b] || 0;
    return sortDesc ? bTotal - aTotal : aTotal - bTotal;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top row: profile */}
      <View style={styles.topRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../../assets/logo.png')} style={styles.flixLogo} />
          <Text style={styles.flixTitle}>FLIX</Text>
        </View>
        <TouchableOpacity onPress={() => setSortDesc(s => !s)} style={{ padding: 8 }}>
          <Image source={require('../../assets/sort.png')} style={{ width: 24, height: 24, tintColor: Colors.primary }} />
        </TouchableOpacity>
      </View>
      {/* Floating Plus Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.dispatch(StackActions.push(ScreenNames.ADDEXPENSE))}
      >
        <Image source={require('../../assets/plus.png')} style={{ width: 24, height: 24, tintColor: Colors.buttonText }} />
      </TouchableOpacity>
      {/* Title */}
      <Text style={styles.title}>Track. Save. Grow {'\n'}Together.</Text>
      {/* Category tiles */}
      {categories.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.subtitle, fontSize: FontSize.large, marginTop: 0, textAlign: 'center' }}>No expenses yet. {'\n'}Tap + to add your first one!</Text>
        </View>
      ) : (
          <FlatList
            data={sortedCategories}
            keyExtractor={item => item}
            numColumns={CARD_COLUMNS}
            // columnWrapperStyle={{ justifyContent: 'space-between', marginHorizontal: CARD_MARGIN }}
            renderItem={({ item }) => {
              const meta = CATEGORY_META[item] || {
                label: item,
                icon: require('../../assets/plus.png'),
                color: Colors.primary,
                tintColor: Colors.primary,
                bg: Colors.backgroundLight,
              };
              const price = (categoryTotals[item] || 0).toFixed(2);

              return (
                <TouchableOpacity
                  style={[styles.planCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
                  onPress={() => navigation.navigate(ScreenNames.EXPENSE_DETAIL, { category: item })}
                  activeOpacity={0.85}
                >
                  <View style={styles.planCardInner}>
                    <Image source={meta.icon} style={[styles.planLogo, { tintColor: Colors.primary }]} />
                    <Text style={styles.planTitle}>{meta.label}</Text>
                    <Text style={styles.planPrice}>₹{price}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
            style={{ marginTop: 16 }}
            showsVerticalScrollIndicator={false}
          />
      )}
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
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: FontSize.xxhuge,
    color: Colors.primaryText,
    fontWeight: 'bold',
    marginBottom: 18,
    marginLeft: 20,
    marginTop: 0,
    lineHeight: 48,
  },
  planCard: {
    borderRadius: 22,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    margin: 8,
    padding: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    minHeight: 180,
    justifyContent: 'flex-start',
  },
  planCardInner: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  planLogo: {
    width: CARD_WIDTH * 0.3,
    height: CARD_WIDTH * 0.3,
    tintColor: Colors.primary,
    borderRadius: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginLeft: 10,
  },
  planIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    marginLeft: 10,
    resizeMode: 'contain',
  },
  planCarrier: {
    fontSize: FontSize.large,
    color: '#222',
    fontWeight: 'bold',
  },
  planCountry: {
    fontSize: FontSize.large,
    color: '#222',
    fontWeight: 'bold',
  },
  planDetailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  planDetails: {
    fontSize: FontSize.large,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  planValidity: {
    fontSize: FontSize.medium,
    color: Colors.inputText,
    fontWeight: '500',
  },
  planPrice: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  flixLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginTop: 4,
    marginRight: 8,
  },
  flixTitle: {
    fontSize: FontSize.xxhuge,
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
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
    color: Colors.buttonText,
    fontSize: FontSize.xlarge,
    fontWeight: 'bold',
    marginTop: -2,
  },
  planTitle: {
    fontSize: FontSize.xxxlarge,
    color: Colors.primaryText,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planChange: {
    fontSize: FontSize.medium,
    fontWeight: '500',
  },
  planChangeUp: {
    color: Colors.success,
  },
  planChangeDown: {
    color: Colors.error,
  },
});