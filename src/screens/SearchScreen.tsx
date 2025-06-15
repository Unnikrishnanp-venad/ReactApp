import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, PermissionsAndroid, TextInput, SafeAreaView } from 'react-native';
import Contacts from 'react-native-contacts';
import Colors from '../constants/colors';
import FontSize from '../constants/fontsize';

const SearchScreen = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);

  useEffect(() => {
    const getContacts = async () => {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      Contacts.getAll()
        .then(fetchedContacts => {
          setContacts(fetchedContacts);
          setFilteredContacts(fetchedContacts);
        })
        .catch(() => {
          setContacts([]);
          setFilteredContacts([]);
        });
    };
    getContacts();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          c =>
            (c.givenName && c.givenName.toLowerCase().includes(lower)) ||
            (c.familyName && c.familyName.toLowerCase().includes(lower)) ||
            (c.phoneNumbers &&
              c.phoneNumbers.some((phone: { number: string })  =>
                phone.number.replace(/\s+/g, '').includes(lower.replace(/\s+/g, ''))
              ))
        )
      );
    }
  }, [searchText, contacts]);

  const sortedContacts = filteredContacts.slice().sort((a, b) => {
    if (!a.givenName) return 1;
    if (!b.givenName) return -1;
    return a.givenName.localeCompare(b.givenName);
  });

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search contacts"
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor={Colors.inactiveDot}
    
      />
      <FlatList
        style={{ backgroundColor: Colors.background }}
        data={sortedContacts}
        keyExtractor={item => item.recordID}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.givenName || 'No Name'}</Text>
            {item.phoneNumbers && item.phoneNumbers.length > 0 ? (
              item.phoneNumbers.map((phone: { number: string }, idx: number) => (
                <Text key={idx} style={styles.phone}>
                  {phone.number}
                </Text>
              ))
            ) : (
              <Text style={styles.phone}>No phone numbers</Text>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: '#0000' }} /> // <-- Change color here
        )}
        ListEmptyComponent={<Text style={styles.empty}>No contacts found.</Text>}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, marginTop: 80 }, // solid black
  searchBar: {
    height: 40,
    borderColor: Colors.borderColor,      // valid dark border
    borderWidth: 1,
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    fontSize: FontSize.large,
    color: Colors.searchBarText,            // white text
    backgroundColor: Colors.searchBarBackground,  // solid black background
    opacity: 1,
  },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor:  Colors.searchBarseperator, backgroundColor: Colors.background },
  name: { fontSize: FontSize.large, color: Colors.primaryText },
  phone: { fontSize: FontSize.medium, color: Colors.subtitle, marginTop: 4,fontWeight: 'light' },
  empty: { textAlign: 'center', marginTop: 40, color:  Colors.subtitle },
});