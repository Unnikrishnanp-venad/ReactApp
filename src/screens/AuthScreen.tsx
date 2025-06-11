import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert, TextInput, ActivityIndicator } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { IOS_CLIENT_ID, WEB_CLIENT_ID } from '../constants/key';
import { googleSignIn } from '../constants/googleSigIn';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";



GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID, // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
  iosClientId: IOS_CLIENT_ID, // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
});
const { width } = Dimensions.get('window');

const AuthScreen = ({ navigation }: any) => {
  // const auth = firebaseAuth
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check AsyncStorage for isAuthed on mount
    const checkAuth = async () => {
      const isAuthed = await AsyncStorage.getItem('isAuthed');
      if (isAuthed === 'true') {
        navigation.replace('HomeTabs');
      } else {
        setLoading(false);
      }
    };
    checkAuth();

    const checkBiometric = async () => {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available } = await rnBiometrics.isSensorAvailable();
      setBiometricAvailable(!!available);
    };
    checkBiometric();
  }, []);

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
          AsyncStorage.setItem('isAuthed', 'true');
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

  const handleCreateAccount = async () => {
    createUserWithEmailAndPassword(getAuth(), email, password)
      .then(() => {
        AsyncStorage.setItem('isAuthed', 'true');
        AsyncStorage.setItem('signInType', 'firebase'); // Store sign-in type
        let user = getAuth().currentUser;
        navigation.replace('Home');
        console.log('User account created & signed in!', user);
      })
      .catch(error => {
        AsyncStorage.setItem('isAuthed', 'false');
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }
        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }
        console.error(error);
      });
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFD600" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/A4.png')} style={styles.logo} />
        <Text style={styles.brand}>FLIX</Text>
      </View>
      <Text style={styles.title}>Keep your online{`\n`}business organized</Text>
      <Text style={styles.subtitle}>Sign up to start your 30 days free trial</Text>
      <GoogleSigninButton
        style={styles.googleButton}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        onPress={() => {
          googleSignIn(
            () => {
              AsyncStorage.setItem('isAuthed', 'true');
              AsyncStorage.setItem('signInType', 'google'); // Store sign-in type
              navigation.replace('Home');
            },
            (error) => {
              if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log("error occured SIGN_IN_CANCELLED");
                // user cancelled the login flow
              } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log("error occured IN_PROGRESS");
                // operation (f.e. sign in) is in progress already
              } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log("error occured PLAY_SERVICES_NOT_AVAILABLE");
              } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
                console.log("error occured SIGN_IN_REQUIRED");
              } else {
                console.log(error);
                console.log("error occured unknow error");
              }
            }
          );
        }}

      />
      <View style={styles.orRow}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#aaa" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="#aaa" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateAccount}
        >
          <Text style={styles.createButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.loginText}>
        Already have an account? <Text style={styles.loginLink} onPress={() => navigation.navigate('SignIn')}>Login Here</Text>
      </Text>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Set background to black
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 8,
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD600',
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#888',
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 8,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  googleButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    marginBottom: 24,
    alignSelf: 'center',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  orText: {
    marginHorizontal: 12,
    color: '#888',
    fontSize: 16,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    color: '#888',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#222',
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  createButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFD600', // Yellow button
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  createButtonText: {
    color: '#111', // Dark text for contrast on yellow
    fontSize: 18,
    fontWeight: '600',
  },
  loginText: {
    color: '#888',
    fontSize: 15,
    marginTop: 12,
    marginBottom: 24,
  },
  loginLink: {
    color: '#FFD600',
    fontWeight: 'bold',
  },
});