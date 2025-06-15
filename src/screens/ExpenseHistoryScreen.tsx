import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TextInput, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';
import { useFocusEffect } from '@react-navigation/native';
import { ExpenseItem } from '../constants/model';
import { StorageKeys } from '../constants/key';
import FontSize from '../constants/fontsize';

const ExpenseHistoryScreen = ({ navigation }: any) => {
  const [history, setHistory] = useState<ExpenseItem[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<ExpenseItem[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dynamicFilters, setDynamicFilters] = useState<{ label: string; value: string }[]>([
    { label: 'All', value: 'all' },
  ]);

  useLayoutEffect(() => {
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const userEmail = await AsyncStorage.getItem(StorageKeys.GOOGLE_USER_EMAIL);
        const stored = await AsyncStorage.getItem(StorageKeys.STORAGE_KEY);
        let data = stored ? JSON.parse(stored) : [];
        // Only use expenses for the logged-in user
        if (userEmail) {
          data = data.filter((item: any) => item.user === userEmail);
        }
        data = data.map((item: any) => ({ ...item, date: new Date(item.date) }));
        const types = Array.from(new Set((data as ExpenseItem[]).map(item => String(item.type)))).filter(Boolean);
        const filters = [
          { label: 'All', value: 'all' },
          ...types.map(type => ({ label: type, value: type })),
        ];
        setDynamicFilters(filters);
        setHistory(data);
        setFiltered(data);
      })();
    }, [])
  );

  useEffect(() => {
    let data = history;
    if (filterType !== 'all') {
      data = data.filter(item => item.type === filterType);
    }
    if (search) {
      data = data.filter(
        (item: any) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()))
      );
    }
    setFiltered(data);
  }, [search, history, filterType]);

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(StorageKeys.STORAGE_KEY);
      setHistory([]);
      setFiltered([]);
    } catch (error) {
      // handle error
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity style={styles.statementBtn} onPress={clearHistory}>
          <Text style={styles.statementBtnText}>My Statements</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions"
          placeholderTextColor={Colors.searchBarPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity onPress={() => setShowFilters(f => !f)}>
          <Image source={require('../../assets/filter.png')} style={{ width: 24, height: 24, marginRight: 18, tintColor:Colors.searchBarPlaceholder}} />
        </TouchableOpacity>
      </View>
      {showFilters && (
        <View style={styles.filterRow}>
          {dynamicFilters.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterBtn, filterType === f.value && styles.filterBtnActive]}
              onPress={() => setFilterType(f.value)}
            >
              <Text style={[styles.filterBtnText, filterType === f.value && styles.filterBtnTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {filtered.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.inputText, fontSize: 20, marginTop: 40 }}>No Records Found</Text>
        </View>
      ) : (
          <SectionList
            sections={groupByDate(filtered)}
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
    color: Colors.primaryText,
    fontWeight: 'bold',
  },
  statementBtn: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#181818',
  },
  statementBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: FontSize.large,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 16,
    marginTop: 18,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.filterButtonBackgroundColor,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterBtnText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: FontSize.medium,
  },
  filterBtnTextActive: {
    color: Colors.header,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.searchBarBackground,
    borderRadius: 32,
    marginHorizontal: 16,
    marginBottom: 0,
    height: 56,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#333',
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
    fontSize: FontSize.large,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemDate: {
    color: Colors.subtitle,
    fontSize: FontSize.medium,
  },
  itemAmount: {
    color: Colors.primary,
    fontSize: FontSize.large,
    fontWeight: 'bold',
  },
  itemDebited: {
    color: Colors.inputText,
    fontSize: FontSize.medium,
    marginRight: 4,
  },
  bankIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});

export default ExpenseHistoryScreen;
