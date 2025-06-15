import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Image, Dimensions } from 'react-native';
import Colors from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../constants/key';
import { ExpenseItem } from '../constants/model';
import { useNavigation, StackActions } from '@react-navigation/native';
import FontSize from '../constants/fontsize';

interface ExpenseFilterScreenProps {
  route: any;
}

const getSelectedCount = (section: string, selected: string, selectedCategory: string) => {
  if (section === 'months' && selected) return 1;
  if (section === 'categories' && selectedCategory) return 1;
  return 0;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

const ExpenseFilterScreen: React.FC<ExpenseFilterScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { selectedMonths: routeSelectedMonths, selectedCategories: routeSelectedCategories, onApplyFilters, page } = route.params || {};
  const [selectedSection, setSelectedSection] = useState('months');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(routeSelectedMonths || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(routeSelectedCategories || []);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [monthsList, setMonthsList] = useState<string[]>([]);
  const [showCategory, setShowCategory] = useState<boolean>(page !== 'expensedetailscreen');
  const [pageName, setPageName] = useState(page || '');

  useEffect(() => {
    console.log('Initial selected months:', selectedMonths);
    console.log('Initial selected categories:', selectedCategories);
    async function fetchFiltersAndSetSelected() {
      const stored = await AsyncStorage.getItem(StorageKeys.STORAGE_KEY);
      let data: ExpenseItem[] = stored ? JSON.parse(stored) : [];
      const monthsSet = new Set<string>();
      const categoriesSet = new Set<string>();
      data.forEach(item => {
        // Months
        const date = new Date(item.date);
        let monthStr = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        if (monthStr.startsWith('Sep')) monthStr = 'Sept' + monthStr.slice(3);
        monthsSet.add(monthStr);
        // Categories
        if (item.type) categoriesSet.add(item.type);
      });
      // Sort months descending (latest first)
      const monthsArr = Array.from(monthsSet);
      monthsArr.sort((a, b) => {
        const [aMonth, aYear] = a.split(' ');
        const [bMonth, bYear] = b.split(' ');
        const aDate = new Date(`${aMonth} 1, ${aYear}`);
        const bDate = new Date(`${bMonth} 1, ${bYear}`);
        return bDate.getTime() - aDate.getTime();
      });
      setMonthsList(monthsArr);
      setCategoriesList(Array.from(categoriesSet));
      console.log('Available months:', monthsArr);
      console.log('Available categories:', Array.from(categoriesSet));
      console.log('Selected months:', selectedMonths);
      console.log('Selected categories:', selectedCategories);
      // Set selected months/categories based on params and data
      console.log('Route selected months:', routeSelectedMonths);
      console.log('Route selected categories:', routeSelectedCategories);


      if (!setShowCategory) {
        console.log('showCategory is false, filtering months only');
        if (routeSelectedCategories && routeSelectedCategories.length === 1) {
          console.log('Filtering months for single selected category:', routeSelectedCategories[0]);

        } else {
          console.log('No specific category filter, using route params or selecting all by default');


        }
        // From ExpenseDetailScreen: select only months for that category
        const filteredMonths = data.filter(item => item.type === routeSelectedCategories[0])
          .map(item => {
            const date = new Date(item.date);
            let monthStr = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
            if (monthStr.startsWith('Sep')) monthStr = 'Sept' + monthStr.slice(3);
            return monthStr;
          });
        console.log('Filtered months:', filteredMonths);
        setSelectedMonths(Array.from(new Set(filteredMonths)));
        console.log('Selected months:', selectedMonths);
        setSelectedCategories(routeSelectedCategories);
      } else {
        console.log('showCategory is false, filtering months only');
        console.log('No specific category filter, using route params or selecting all by default');
        // If showCategory is true, select all months/categories by default
        // From ExpenseHistoryScreen: use params or select all by default
        setSelectedMonths(routeSelectedMonths || []);
        setSelectedCategories(routeSelectedCategories || []);
      }
      setSelectedSection('months');
      // Set showCategory based on pageName
      setShowCategory(pageName !== 'expensedetailscreen');
    }
    fetchFiltersAndSetSelected();
    if (page) setPageName(page);
  }, [routeSelectedMonths, routeSelectedCategories, page, pageName]);

  useEffect(() => {
    const loadSavedFilters = async () => {
      try {
        const saved = await AsyncStorage.getItem(StorageKeys.EXPENSE_FILTER_SELECTIONS);
        if (saved) {
          const { selectedMonths, selectedCategories, showCategory: savedShowCategory, page } = JSON.parse(saved);
          if (Array.isArray(selectedMonths)) setSelectedMonths(selectedMonths);
          if (Array.isArray(selectedCategories)) setSelectedCategories(selectedCategories);
          if (typeof page === 'string') {
            setPageName(page);
            setShowCategory(page !== 'expensedetailscreen');
          } else if (typeof savedShowCategory === 'boolean') {
            setShowCategory(savedShowCategory);
          }
        }
      } catch (e) {
        // handle error if needed
      }
    };
    loadSavedFilters();
  }, []);

  const handleSelectMonth = (month: string) => {
    setSelectedMonths((prev: string[]) => prev.includes(month) ? prev.filter((m: string) => m !== month) : [...prev, month]);
  };
  const handleSelectCategory = (cat: string) => {
    setSelectedCategories((prev: string[]) => prev.includes(cat) ? prev.filter((c: string) => c !== cat) : [...prev, cat]);
  };
  const handleClear = () => {
    setSelectedMonths([]);
    setSelectedCategories([]);
  };

  // Only show category section if showCategory is true
  const FILTER_SECTIONS = [
    { key: 'months', label: 'Months' },
    ...(showCategory ? [{ key: 'categories', label: 'Categories' }] : []),
  ];

  let options: string[] = [];
  let selectedValues: string[] = [];
  let onSelect: (val: string) => void = () => {};
  if (selectedSection === 'months') {
    options = monthsList;
    selectedValues = selectedMonths;
    onSelect = handleSelectMonth;
  } else if (selectedSection === 'categories' && showCategory) {
    options = categoriesList;
    selectedValues = selectedCategories;
    onSelect = handleSelectCategory;
  }

  const handleUpdate = async () => {
    // Save selectedMonths, selectedCategories, and page to storage
    try {
      await AsyncStorage.setItem(
        StorageKeys.EXPENSE_FILTER_SELECTIONS,
        JSON.stringify({ selectedMonths, selectedCategories, showCategory, page: pageName })
      );
    } catch (e) {
      console.error('Failed to save filter selections:', e);
    }
    if (onApplyFilters) {
      onApplyFilters({
        selectedMonths,
        selectedCategories,
      });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.overlay}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.dispatch(StackActions.pop(1))} style={styles.backButton}>
            <Image source={require('../../assets/back.png')} style={{ width: 28, height: 28, tintColor: Colors.primary }} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}><Text style={styles.clear}>Clear All</Text></TouchableOpacity>
      </View>
      <View style={styles.bodyRow}>
        <View style={styles.sidebar}>
          {FILTER_SECTIONS.map(section => {
            const count = section.key === 'months'
              ? selectedMonths.length
              : selectedCategories.length;
            return (
              <TouchableOpacity
                key={section.key}
                style={[styles.sidebarTab, selectedSection === section.key && styles.sidebarTabActive]}
                onPress={() => setSelectedSection(section.key)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.sidebarTabText, selectedSection === section.key && styles.sidebarTabTextActive]}>{section.label}</Text>
                  {count > 0 && (
                    <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.optionsCol}>
          <FlatList
            data={options}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => onSelect(item)}>
                <Text style={styles.rowText}>{item}</Text>
                <View style={styles.checkbox}>{selectedValues.includes(item) && <View style={styles.checked} />}</View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
        <Text style={styles.updateBtnText}>UPDATE CHANGES</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
        alignItems: 'center',
    marginTop: 40,
    paddingTop: 0,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  backButton: {
    marginRight: 0,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  clearBtn: {
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 22,
    color: Colors.primaryText,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
  },
  clear: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: FontSize.xxlarge,
      marginLeft: 8,
    marginTop:10,
  },
  bodyRow: {
    flexDirection: 'row',
    flex: 1,
    minHeight: 350,
  },
  sidebar: {
    width: SCREEN_WIDTH * 0.4,
    backgroundColor: Colors.collectionBackground,
    borderRightWidth: 1,
    borderRightColor: Colors.borderColor,
    paddingTop: 0,
  },
  sidebarTab: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarTabActive: {
    backgroundColor: Colors.background,
    borderLeftColor: Colors.primary,
  },
  sidebarTabText: {
    color: Colors.primaryText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sidebarTabTextActive: {
    color: Colors.primary,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    marginLeft: 8,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    fontSize: 13,
  },
  optionsCol: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  rowText: {
    color: Colors.primaryText,
    fontSize: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: Colors.primaryText,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    width: 14,
    height: 14,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  updateBtn: {
    backgroundColor: Colors.background,
    borderRadius: 0,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 0,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  updateBtnText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
    paddingBottom: 20,
  },
});

export default ExpenseFilterScreen;
