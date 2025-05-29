import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';

const { width } = Dimensions.get('window');

const AuthScreen = ({ navigation }: any) => {
  const handleBiometricAuth = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    const { available } = await rnBiometrics.isSensorAvailable();

    if (!available) {
      Alert.alert('Biometric authentication not available');
      return;
    }

    rnBiometrics.simplePrompt({ promptMessage: 'Authenticate' })
      .then(resultObject => {
        const { success } = resultObject;

        if (success) {
          Alert.alert('Authenticated!', 'You have successfully authenticated.');
          navigation.replace('Home'); // Navigate to Home screen
        } else {
          Alert.alert('Authentication cancelled');
        }
      })
      .catch(() => {
        Alert.alert('Authentication error', 'Biometric authentication failed');
      });
  };

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
        <TouchableOpacity style={styles.button} onPress={handleBiometricAuth}>
          <Text style={styles.buttonText}>Authentication</Text>
         </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 12 }]}
          onPress={() => navigation.navigate('Registration')}
        >
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