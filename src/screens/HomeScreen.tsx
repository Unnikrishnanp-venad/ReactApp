import React, { useEffect } from 'react';
import { View, Text, StyleSheet,Alert } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎉 You're in the Home Screen!</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7476e3' },
  text: { fontSize: 20 },
});