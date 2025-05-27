import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const AuthScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Image
          source={require('../../assets/A4.png')}
          style={styles.image}
        />
        <Text style={styles.text}>Welcome! Please sign in or sign up to continue.</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Authentication</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { marginTop: 12 }]}>
          <Text style={styles.buttonText}>Registration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  topContent: {
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
    borderRadius: 24,
  },
  text: {
    fontSize: 18,
    color: '#ffff',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 24,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#5f6dff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});