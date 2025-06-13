import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addHistoryExpense } from './HistoryScreen';
import { ScreenNames } from '../constants/screenNames';
import Toast from 'react-native-toast-message';

const STORAGE_KEY = 'lastAdded';

// Define the type for an entry
interface LastAddedEntry {
  id: string;
  icon: any;
  label: string;
  date: string;
  amount: string;
  color: string;
  amountColor: string;
}

// Expense category enum
export enum ExpenseCategory {
  GROCERIES = 'Groceries',
  FOOD = 'Food',
  FUEL = 'Fuel',
  WATER = 'Water',
  RENT = 'Rent',
  ELECTRICITY = 'Electricity',
  MEDICAL = 'Medical',
  INTERNET = 'Internet',
  AMAZON = 'Amazon',
  PERSONAL_CARE = 'Personal Care',
  VEHICLE_MAINTENANCE = 'Vehicle Maintenance',
  CLOTHING = 'Clothing',
  LOAN_EMI = 'Loan EMI',
  ENTERTAINMENT = 'Entertainment',
  TRAVEL = 'Travel',
}

const AddScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [lastAddedList, setLastAddedList] = React.useState<LastAddedEntry[]>([]); // Typed state
  const [selectedCategory, setSelectedCategory] = React.useState<ExpenseCategory>(ExpenseCategory.GROCERIES);

  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLastAddedList(JSON.parse(stored));
      }
    })();
  }, []);

  const handleKeypadPress = (val: string) => {
    if (val === '⌫') {
      setAmount(a => a.slice(0, -1));
    } else if (val === '✓') {
      handleSave();
    } else {
      setAmount(a => (a === '0' ? val : a + val));
    }
  };

  const handleSave = async () => {
    if (!amount) {
      Toast.show({
        type: 'error',
        text1: 'Enter amount',
        text2: 'Please enter an amount before saving.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    let label = comment || 'Expense';
    let color = '#e67e22';
    let amountColor = '#e74c3c';
    let icon = require('../../assets/history.png');
    const newItem = {
      id: Date.now().toString(),
      icon,
      label,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: '-' + '$' + amount,
      color,
      amountColor,
      category: selectedCategory, // Save selected category
    };
    const updated = [newItem, ...lastAddedList];
    setLastAddedList(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    await addHistoryExpense({ label: newItem.label, amount, category: selectedCategory });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../../assets/back.png')} style={{ width: 28, height: 28, tintColor: Colors.button }} />
        </TouchableOpacity>
      </View>
      {/* Horizontal collection chips */}
      <View style={{ marginTop: 8, marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, height: 50, minWidth: 150 }}>
          {Object.values(ExpenseCategory).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isSelected && { borderColor: Colors.borderColor, backgroundColor: Colors.button }]}
                onPress={() => setSelectedCategory(cat as ExpenseCategory)}
              >
                <Text style={[styles.chipText, !isSelected && { color: Colors.headerText }]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.formContent}>
        <Text style={styles.modalLabel}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountValue}>{amount || '0'}</Text>
        </View>

        <TouchableOpacity
          style={{ width: '100%', marginBottom: 12 }}
          activeOpacity={1}
          onPress={() => { }} // For now, not editable
        >
          <Text style={{ color: '#888', fontSize: 16, padding: 8 }}>{comment}</Text>
        </TouchableOpacity>
        {/* Keypad */}
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['0', null, '✓'],
        ].map((row, i) => (
          <View style={styles.keypadRow} key={i}>
            {row.map((val, j) => {
              if (i === 3 && j === 1) {
                // Insert delete image button in place of '⌫'
                return (
                  <TouchableOpacity
                    key="delete"
                    style={styles.keypadButton}
                    onPress={() => handleKeypadPress('⌫')}
                  >
                    <Image
                      source={require('../../assets/delete.png')}
                      style={{ width: 28, height: 28, tintColor: Colors.headerText }}
                    />
                  </TouchableOpacity>
                );
              }
              if (val === '✓') {
                // Insert check image button in place of '✓'
                return (
                  <TouchableOpacity
                    key="check"
                    style={styles.keypadButton}
                    onPress={() => handleKeypadPress('✓')}
                  >
                    <Image
                      source={require('../../assets/check.png')}
                      style={{ width: 28, height: 28, tintColor: '#fff' }}
                    />
                  </TouchableOpacity>
                );
              }
              return val ? (
                <TouchableOpacity
                  key={val}
                  style={styles.keypadButton}
                  onPress={() => handleKeypadPress(val)}
                >
                  <Text style={styles.keypadText}>{val}</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flex: 1 }} key={j} />
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 16,
    width: '100%',
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.headerText,
    flex: 1,
    textAlign: 'center',
    marginRight: 44, // To center title with back button
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 24,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 28, // increased
    borderRadius: 22, // slightly more rounded
    marginHorizontal: 8,
    marginVertical: 14, // more vertical space
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    width: '40%',
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  actionIcon: {
    width: 48, // increased
    height: 48, // increased
    marginBottom: 0,
    resizeMode: 'contain',
  },
  actionIconContainer: {
    width: 64, // increased
    height: 64, // increased
    borderRadius: 20, // more rounded
    backgroundColor: Colors.collectionBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14, // more space below icon
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.headerText,
    marginLeft: 24,
    marginBottom: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  listIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  listLabel: {
    color: Colors.headerText,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  listDate: {
    color: '#888',
    fontSize: 13,
  },
  listAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },

  formContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.headerText,
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  modalLabel: {
    color: '#888',
    fontSize: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountCurrency: {
    fontSize: 32,
    color: '#888',
    marginRight: 4,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.headerText,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,

  },
  keypadButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.collectionBackground,
    borderRadius: 18,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  keypadText: {
    fontSize: 40,
    color: Colors.headerText,
    fontWeight: 'bold',
  },
  closeModalBtn: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: Colors.button,
    borderRadius: 18,
  },
  closeModalText: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center text horizontally
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 12,
    backgroundColor: Colors.collectionBackground,
    minWidth: 100, // Minimum width for each chip
  },
  chipText: {
    color: Colors.buttonText,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    textAlign: 'center', // Center text inside the chip
  },
});

export default AddScreen;
