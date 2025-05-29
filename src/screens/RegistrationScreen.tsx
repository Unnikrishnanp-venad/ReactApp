import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const RegistrationScreen = () => {
  return (
    <View style={styles.container}>
      <WebView source={{ uri: 'https://www.apple.com/' }} />
    </View>
  );
};

export default RegistrationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});