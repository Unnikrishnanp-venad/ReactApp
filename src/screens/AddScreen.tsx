import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addHistoryExpense } from './HistoryScreen';
import { ScreenNames } from '../constants/screenNames';

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

const AddScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [lastAddedList, setLastAddedList] = React.useState<LastAddedEntry[]>([]); // Typed state

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
    } else if (val === ',') {
      if (!amount.includes('.')) setAmount(a => a + '.');
    } else if (val === '✓') {
      handleSave();
    } else if (val === '$') {
      // ignore for now
    } else {
      setAmount(a => (a === '0' ? val : a + val));
    }
  };

  const handleSave = async () => {
    if (!amount) return;
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
    };
    const updated = [newItem, ...lastAddedList];
    setLastAddedList(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    await addHistoryExpense({ label: newItem.label, amount });
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          <View style={styles.chip}><Text style={styles.chipText}><Text style={{fontSize:20}}>🟢</Text> Veg</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}><Text style={{fontSize:20}}>🥚</Text> Egg</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}><Text style={{fontSize:20}}>🔺</Text> Non-veg</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}><Text style={{fontSize:20}}>👍</Text> Friends' R</Text></View>
        </ScrollView>
      </View>
      <View style={styles.formContent}>
        <Text style={styles.modalLabel}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountCurrency}>$</Text>
          <Text style={styles.amountValue}>{amount || '0'}</Text>
        </View>
        <Text style={styles.modalLabel}>Add comment...</Text>
        <TouchableOpacity
          style={{ width: '100%', marginBottom: 12 }}
          activeOpacity={1}
          onPress={() => {}} // For now, not editable
        >
          <Text style={{ color: '#888', fontSize: 16, padding: 8 }}>{comment}</Text>
        </TouchableOpacity>
        {/* Keypad */}
        {[
          ['1', '2', '3', '⌫'],
          ['4', '5', '6', '📅'],
          ['7', '8', '9', '✓'],
          ['$', '0', ',', ''],
        ].map((row, i) => (
          <View style={styles.keypadRow} key={i}>
            {row.map((val, j) =>
              val ? (
                <TouchableOpacity
                  key={val}
                  style={
                    val === '✓'
                      ? [styles.keypadButton, { backgroundColor: '#000', flex: 1 }]
                      : val === '⌫'
                      ? [styles.keypadButton, { backgroundColor: '#fbe9e7' }]
                      : val === '📅'
                      ? [styles.keypadButton, { backgroundColor: '#e3eaff' }]
                      : val === '$'
                      ? [styles.keypadButton, { backgroundColor: '#fffbe6' }]
                      : styles.keypadButton
                  }
                  onPress={() => handleKeypadPress(val)}
                >
                  <Text
                    style={
                      val === '✓'
                        ? [styles.keypadText, { color: '#fff' }]
                        : styles.keypadText
                    }
                  >
                    {val}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flex: 1 }} key={j} />
              )
            )}
          </View>
        ))}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeModalBtn}>
          <Text style={styles.closeModalText}>Close</Text>
        </TouchableOpacity>
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
    backgroundColor:Colors.background,
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
    backgroundColor: '#fff',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(19, 238, 117, 0.12)',
    justifyContent: 'flex-end',
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
    fontSize: 40,
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
    backgroundColor: '#f6f6f6',
    borderRadius: 18,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadText: {
    fontSize: 24,
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
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 12,
    backgroundColor: Colors.collectionBackground,
  },
  chipText: {
    color: Colors.headerText,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
});

export default AddScreen;
