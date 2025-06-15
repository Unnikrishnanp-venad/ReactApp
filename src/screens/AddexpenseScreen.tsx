import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, TextInput, Dimensions } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import Colors from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenNames } from '../constants/screenNames';
import Toast from 'react-native-toast-message';
import { ExpenseItem } from '../constants/model';
import { ExpenseCategory, StorageKeys } from '../constants/key';
import FontSize from '../constants/fontsize';

const MAX_AMOUNT = 99999; // Set your desired maximum value
const SCREEN_WIDTH = Dimensions.get('window').width;
const KEYPAD_BUTTON_MARGIN = 6; // same as marginHorizontal in style
const KEYPAD_BUTTONS_PER_ROW = 3;
const KEYPAD_BUTTON_WIDTH = (SCREEN_WIDTH * 0.9 - (KEYPAD_BUTTONS_PER_ROW + 1) * KEYPAD_BUTTON_MARGIN * 2) / KEYPAD_BUTTONS_PER_ROW;

const AddexpenseScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<ExpenseCategory>(ExpenseCategory.GROCERIES);

  const handleKeypadPress = (val: string) => {
    if (val === '⌫') {
      setAmount(a => a.slice(0, -1));
    } else if (val === '✓') {
      handleSave();
    } else {
      setAmount(a => {
        const next = a === '0' ? val : a + val;
        if (parseFloat(next) > MAX_AMOUNT) {
          return a; // Ignore input if over max
        }
        return next;
      });
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
    const name = await AsyncStorage.getItem(StorageKeys.GOOGLE_USER_NAME);
    const email = await AsyncStorage.getItem(StorageKeys.GOOGLE_USER_EMAIL);
    const userPhoto = await AsyncStorage.getItem(StorageKeys.GOOGLE_USER_PHOTO);
    let label = name || email || 'Unknown User';
    const expense: ExpenseItem = {
      id: Date.now().toString(),
      title: selectedCategory,
      subtitle: comment || 'No comment',
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      type: selectedCategory,
      user: email || label,
      userPhoto: userPhoto || ''// Always use email for user field
    };
    const stored = await AsyncStorage.getItem(StorageKeys.STORAGE_KEY);
    let updated: ExpenseItem[] = [];
    try {
      updated = stored ? [expense, ...JSON.parse(stored)] : [expense];
    } catch (e) {
      updated = [expense];
    }
    try {
      await AsyncStorage.setItem(StorageKeys.STORAGE_KEY, JSON.stringify(updated));
      navigation.goBack();
    } catch (e) {
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
      {/* Back button header, matching AddScreen */}
      <View style={[styles.headerRow, { paddingTop: 20 }]}> 
        <TouchableOpacity onPress={() =>  navigation.dispatch(StackActions.pop(1))} style={styles.backButton}>
          <Image source={require('../../assets/back.png')} style={{ width: 28, height: 28, tintColor: Colors.primary }} />
        </TouchableOpacity>
      </View>
      {/* Horizontal collection chips */}
      <View style={{ marginTop: 0, marginBottom: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, height: 50, minWidth: 120 }}>
          {Object.values(ExpenseCategory).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isSelected && { borderColor: Colors.primary, backgroundColor: Colors.primary }]}
                onPress={() => setSelectedCategory(cat as ExpenseCategory)}
              >
                <Text style={[styles.chipText, !isSelected && { color: Colors.subtitle }]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View style={[styles.formContent, { flex: 1, width: '100%' }]}> 
        <Text style={styles.modalLabel}>How much did you spend?</Text>
         <View style={styles.amountRow}>
          <Text style={styles.amountValue} numberOfLines={1} ellipsizeMode="tail">{amount || '0'}</Text>
        </View> 
         <TextInput
          style={{
            width: '100%',
            backgroundColor: Colors.searchBarBackground,
            color: Colors.primaryText,
            fontSize: FontSize.large,
            borderRadius: 10,
            borderColor: Colors.borderColor,
            borderWidth: 1,
            padding: 10,
            marginBottom: 12,
          }}
          placeholder="Add a note"
          placeholderTextColor={Colors.searchBarPlaceholder}
          value={comment}
          onChangeText={setComment}
          multiline
        />
      {/* Keypad restored below, matching AddScreen */}
      {[
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['0', '', '✓'],
      ].map((row, i) => (
        <View style={styles.keypadRow} key={`row-${i}`}>
          {row.map((val, j) => {
            const keyStr = typeof val === 'string' ? val || `empty-${i}-${j}` : String(val);
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
                    style={{ width: 28, height: 28, tintColor: Colors.error }}
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
                    style={{ width: 28, height: 28, tintColor: Colors.primary }}
                  />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={keyStr}
                style={styles.keypadButton}
                onPress={() => handleKeypadPress(val)}
              >
                <Text style={styles.keypadText}>{val}</Text>
              </TouchableOpacity>
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
  formContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  modalLabel: {
    color: Colors.subtitle,
    fontSize: FontSize.large,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountValue: {
    fontSize: FontSize.massive,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  bottomBackButton: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  bottomBackButtonText: {
    color: Colors.primaryText,
    fontSize: FontSize.xlarge,
    fontWeight: 'bold',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 12,
    height: 50,
    backgroundColor: Colors.collectionBackground,
    minWidth: 100,
  },
  chipText: {
    color: Colors.buttonText,
    fontSize: FontSize.large,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    textAlign: 'center',
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
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  keypadButton: {
    width: KEYPAD_BUTTON_WIDTH,
    height: KEYPAD_BUTTON_WIDTH,
    backgroundColor: Colors.keypadBackground,
    borderRadius: (KEYPAD_BUTTON_WIDTH / 2 ) * 0.5,
    marginHorizontal: KEYPAD_BUTTON_MARGIN,
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
    fontSize: FontSize.massive,
    color: Colors.primaryText,
    fontWeight: 'bold',
  },
});

export default AddexpenseScreen;
