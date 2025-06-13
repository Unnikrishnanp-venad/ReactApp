import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenNames } from '../constants/screenNames';
import Toast from 'react-native-toast-message';
import { ExpenseItem } from '../constants/model';
import { StorageKeys } from '../constants/key';


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
  const [selectedCategory, setSelectedCategory] = React.useState<ExpenseCategory>(ExpenseCategory.GROCERIES);
  var userName: string;
  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(StorageKeys.STORAGE_KEY);
      if (stored) {
        // Removed setLastAddedList as per the change request
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
    console.log('Please enter an amount before saving', amount);
    if (!amount) {
      Toast.show({
        type: 'error',
        text1: 'Enter amount',
        text2: 'Please enter an amount before saving.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      console.log('[AddScreen] No amount entered, not saving.');
      return;
    }
    const name = await AsyncStorage.getItem(StorageKeys.GOOGLE_USER_NAME);
    const email = await AsyncStorage.getItem(StorageKeys.GOOGLE_USER_EMAIL);
    console.log('[AddScreen] User name:', name);
    let label = name || email || 'Unknown User';
    const expense: ExpenseItem = {
      id: Date.now().toString(),
      title: selectedCategory,
      subtitle: comment || label, // Use comment as subtitle if provided, else fallback to user label
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      type: selectedCategory,
      user: label,
    };
    console.log('[AddScreen] Saving expense:', expense);

    // Fetch existing expenses from AsyncStorage
    const stored = await AsyncStorage.getItem(StorageKeys.STORAGE_KEY);
    console.log('[AddScreen] Raw stored value:', stored);
    let updated: ExpenseItem[] = [];
    try {
      updated = stored ? [expense, ...JSON.parse(stored)] : [expense];
    } catch (e) {
      console.error('[AddScreen] Error parsing stored expenses:', e);
      updated = [expense];
    }
    // Save the updated list back to AsyncStorage
    try {
      await AsyncStorage.setItem(StorageKeys.STORAGE_KEY, JSON.stringify(updated));
      navigation.goBack();
    } catch (e) {
      console.error('[AddScreen] Error saving expenses:', e);
      Toast.show({
        type: 'error',
        text1: 'Save failed',
        text2: 'Could not save expense. Try again.',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={[styles.headerRow, { paddingTop: 0 }]}> {/* Remove extra top padding, SafeAreaView handles it */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../../assets/back.png')} style={{ width: 28, height: 28, tintColor: Colors.button }} />
        </TouchableOpacity>
      </View>
      {/* Horizontal collection chips */}
      <View style={{ marginTop: 0, marginBottom: 0 }}>
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
      <View style={[styles.formContent, { flex: 1, width: '100%' }]}> {/* Ensure formContent fills available space */}
        <Text style={styles.modalLabel}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountValue} numberOfLines={1} ellipsizeMode="tail">{amount || '0'}</Text>
        </View>
        <TextInput
          style={{
            width: '100%',
            backgroundColor: Colors.collectionBackground,
            color: Colors.headerText,
            fontSize: 16,
            borderRadius: 10,
            padding: 10,
            marginBottom: 12,
          }}
          placeholder="Add a comment"
          placeholderTextColor="#888"
          value={comment}
          onChangeText={setComment}
          multiline
        />
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
    marginBottom: 0,
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
