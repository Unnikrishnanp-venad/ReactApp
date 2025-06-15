import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TextInput, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';
import { useFocusEffect } from '@react-navigation/native';
import { ExpenseItem } from '../constants/model';
import { StorageKeys } from '../constants/key';
import FontSize from '../constants/fontsize';
import { ScreenNames } from '../constants/screenNames';

const ExpenseDetailScreen = ({ navigation, route }: any) => {
  const { category } = route.params;
  const [history, setHistory] = useState<ExpenseItem[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<ExpenseItem[]>([]);
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useLayoutEffect(() => {
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);

  useFocusEffect(

    React.useCallback(() => {
      // Fetch expenses from storage when the screen is focused
      (async () => {
        const userEmail = await AsyncStorage.getItem(StorageKeys.GOOGLE_USER_EMAIL);
        const stored = await AsyncStorage.getItem(StorageKeys.STORAGE_KEY);
        let data = stored ? JSON.parse(stored) : [];
        // Only use expenses for the logged-in user and selected category
        console.log('Fetching expenses for user:', userEmail, 'and category:', category);
        if (userEmail) {
          data = data.filter((item: any) => item.user === userEmail && item.type === category);
        }
        data = data.map((item: any) => ({ ...item, date: new Date(item.date) }));
        setHistory(data);
        setFiltered(data);
      })();
    }, [category])
  );

  // Set the screen title to the selected category
  const screenTitle = category;

  const handleOpenFilters = async () => {
    // Fetch latest expenses from storage for the current user and category
    const userEmail = await AsyncStorage.getItem(StorageKeys.GOOGLE_USER_EMAIL);
    const stored = await AsyncStorage.getItem(StorageKeys.STORAGE_KEY);
    let data = stored ? JSON.parse(stored) : [];
    if (userEmail) {
      data = data.filter((item: any) => item.user === userEmail && item.type === category);
    }
    data = data.map((item: any) => ({ ...item, date: new Date(item.date) }));

    // Extract unique months and categories from the filtered data
    const months = Array.from(new Set(data.map((item: any) => {
      const date = new Date(item.date);
      return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }))).filter((m): m is string => typeof m === 'string');
    const categories = Array.from(new Set(data.map((item: any) => item.type))).filter((c): c is string => typeof c === 'string');
    console.log('Available months:', months);
    console.log('Available categories:', categories);
    // Use these as the selected filters
    setSelectedMonths(months);
    setSelectedCategories(categories);

  // Navigate to ExpenseFilterScreen with selected months and categories
    navigation.navigate(ScreenNames.EXPENSE_FILTER, {
      selectedMonths: months,
      selectedCategories: categories,
      showCategory: false, // Hide category filter when coming from ExpenseDetailScreen
      onApplyFilters: (filters: { selectedMonths: string[]; selectedCategories: string[] }) => {
        // If both are empty, show no data and update state
        if (filters.selectedMonths.length === 0 && filters.selectedCategories.length === 0) {
          console.log('No filters applied, showing all data');
          setSelectedMonths([]);
          setSelectedCategories([]);
          setFiltered([]);
          return;
        }
        setSelectedMonths(filters.selectedMonths);
        setSelectedCategories(filters.selectedCategories);
      },
    });
  };

  useEffect(() => {
    let data = history;
    if (search) {
      data = data.filter(
        (item: any) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase())) ||
          (item.amount && String(item.amount).includes(search))
      );
    }
    setFiltered(data);
  }, [search, history]);

  useEffect(() => {
    let data = history;
    if (selectedMonths && selectedMonths.length > 0) {
      data = data.filter(item => {
        const date = new Date(item.date);
        const monthStr = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        return selectedMonths.some(selMonth =>
          selMonth.startsWith('Sept')
            ? monthStr.startsWith('Sep') && monthStr.endsWith(selMonth.slice(-4))
            : monthStr === selMonth
        );
      });
    }
    if (selectedCategories && selectedCategories.length > 0) {
      data = data.filter(item => selectedCategories.includes(item.type));
    }
    if (search) {
      data = data.filter(
        (item: any) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase())) ||
          (item.amount && String(item.amount).includes(search))
      );
    }
    setFiltered(data);
  }, [search, history, selectedMonths, selectedCategories]);

  function getUserColor(user: string) {
    const colors = [
      '#FFB300', '#F4511E', '#8E24AA', '#3949AB', '#039BE5', '#43A047', '#FDD835', '#FB8C00', '#6D4C41', '#757575', '#00897B', '#C62828'
    ];
    let hash = 0;
    for (let i = 0; i < user.length; i++) {
      hash = user.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  }

  function getSectionTitle(dateString: string) {
    const today = new Date();
    const date = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDate(date: Date) {
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) {
      return 'Just now';
    } else if (diff < 60 * 60) {
      const mins = Math.floor(diff / 60);
      return mins === 1 ? '1 minute ago' : `${mins} minutes ago`;
    } else if (diff < 60 * 60 * 24) {
      const hours = Math.floor(diff / 3600);
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else {
      const days = Math.floor(diff / (60 * 60 * 24));
      return days === 1 ? '1 day ago' : `${days} days ago`;
    }
  }

  function groupByDate(expenses: ExpenseItem[]) {
    const groups: { [date: string]: ExpenseItem[] } = {};
    expenses.forEach(item => {
      const dateKey = new Date(item.date).toLocaleDateString('en-CA');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return Object.entries(groups)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, data]) => ({
        title: date,
        data,
      }));
  }

  const renderItem = ({ item, index }: { item: ExpenseItem, index: number }) => (
    <View style={styles.itemRow}>
      {item.userPhoto ? (
        <Image
          source={{ uri: item.userPhoto }}
          style={[styles.iconBox, { borderRadius: 24, backgroundColor: 'transparent' }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.iconBox, { backgroundColor: getUserColor(item.user || '') }]}> 
          <Text style={{ fontSize: 22, color: Colors.buttonText, fontWeight: 'bold' }}>
            {item.user && typeof item.user === 'string' && item.user.length > 0 ? item.user[0].toUpperCase() : '?'}
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemSubtitle, { maxWidth: 120 }]}>{item.subtitle}</Text>
        <Text style={[styles.itemTitle, { maxWidth: 120 }]}>{item.title}</Text>
        <Text style={[styles.itemDate, { maxWidth: 120 }]}>{formatDate(new Date(item.date))}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', maxWidth: 120 }}>
        <Text style={[styles.itemAmount, { maxWidth: 120 }]} numberOfLines={1} ellipsizeMode="tail">₹{item.amount}</Text>
      </View>
    </View>
  );

  // Sort filtered data by amount
  const sortedFiltered = [...filtered].sort((a, b) => sortDesc ? b.amount - a.amount : a.amount - b.amount);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, paddingTop: 20 }}>
      {/* Back button header, matching AddScreen */}
      <View style={[styles.headerRow, { paddingTop: 20 }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../../assets/back.png')} style={{ width: 28, height: 28, tintColor: Colors.primary }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <TouchableOpacity onPress={() => setSortDesc(s => !s)} style={{ padding: 8 }}>
          <Image source={require('../../assets/sort.png')} style={{ width: 24, height: 24, tintColor: Colors.primary }} />
        </TouchableOpacity>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { color: Colors.primaryText }]}
          placeholder="Search transactions"
          placeholderTextColor={Colors.searchBarPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          onPress={handleOpenFilters}
          disabled={history.length === 0}
          style={{ opacity: history.length === 0 ? 0.4 : 1 }}
        >
          <Image source={require('../../assets/filter.png')} style={{ width: 24, height: 24, marginRight: 18, tintColor: Colors.primary }} />
        </TouchableOpacity>
      </View>
      {filtered.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.inputText, fontSize: 20, marginTop: 40 }}>No Records Found</Text>
        </View>
      ) : (
          <SectionList
            key={`${selectedMonths.join(',')}-${selectedCategories.join(',')}`}
            sections={groupByDate(sortedFiltered)}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={{ color: Colors.inputText, fontWeight: 'bold', fontSize: 18, marginLeft: 18, marginTop: 18, marginBottom: 10, backgroundColor: Colors.background }}>
                {getSectionTitle(title)}
              </Text>
            )}
            contentContainerStyle={{ paddingBottom: 32 }}
            style={{ marginTop: 0 }}
            stickySectionHeadersEnabled={false}
          />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 0,
    paddingTop: 80,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: FontSize.xlarge,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  statementBtn: {
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: Colors.collectionBackground,
  },
  statementBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: FontSize.large,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.searchBarBackground,
    borderRadius: 32,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 0,
    height: 56,
  },
  searchInput: {
    flex: 1,
    color: Colors.primaryText,
    fontSize: FontSize.large,
    marginLeft: 18,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 18,
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 16,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemSubtitle: {
    color: Colors.subtitle,
    fontSize: FontSize.medium,
    marginBottom: 2,
  },
  itemTitle: {
    color: Colors.primaryText,
    fontSize: FontSize.xxxlarge,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemDate: {
    color: Colors.subtitle,
    fontSize: FontSize.medium,
  },
  itemAmount: {
    color: Colors.primary,
    fontSize: FontSize.huge,
    fontWeight: 'bold',
  },
  itemDebited: {
    color: Colors.inputText,
    fontSize: FontSize.medium,
    marginRight: 4,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
});

export default ExpenseDetailScreen;
