import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SearchScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>This is Search Tab!</Text>
  </View>
);

export default SearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4287f5' },
  text: { fontSize: 20 },
});