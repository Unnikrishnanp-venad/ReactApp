import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Keyboard } from 'react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/colors';
import { StackActions } from '@react-navigation/native';

// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";



GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID, // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
  iosClientId: IOS_CLIENT_ID, // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
});
const { width } = Dimensions.get('window');

const AuthScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  // const auth = firebaseAuth
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const emailInputRef = React.useRef<TextInput | null>(null);
  const passwordInputRef = React.useRef<TextInput | null>(null);

  // Helper to scroll to input
  const scrollToInput = (ref: React.RefObject<TextInput | null>) => {
    setTimeout(() => {
      ref.current?.measureLayout(
        scrollViewRef.current?.getInnerViewNode?.() || scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: Math.max(y - 40, 0), animated: true });
        },
        () => { }
      );
    }, 100);
  };

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

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    });
    return () => keyboardDidHideListener.remove();
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
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    createUserWithEmailAndPassword(getAuth(), email, password)
      .then(() => {
        AsyncStorage.setItem('isAuthed', 'true');
        AsyncStorage.setItem('signInType', 'firebase');
        let user = getAuth().currentUser;
        navigation.replace('Home');
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
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.header }}>
        <ActivityIndicator size="large" color={Colors.button} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets?.top, paddingBottom: insets?.bottom }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 64}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentBox}>
            <View style={styles.header}>
              <Image source={require('../../assets/A4.png')} style={styles.logo} />
              <Text style={styles.brand}>FLIX</Text>
            </View>
            <Text style={styles.title}>Keep your online{`\n`}business organized</Text>
            <Text style={styles.subtitle}>Sign up to start your 30 days free trial</Text>
            <GoogleSigninButton
              style={styles.googleButton}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={() => {
                googleSignIn(
                  () => {
                    AsyncStorage.setItem('isAuthed', 'true');
                    AsyncStorage.setItem('signInType', 'google');
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
              <Text style={styles.label}>Email</Text>
              <TextInput
                ref={emailInputRef}
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => scrollToInput(emailInputRef)}
              />
              <Text style={styles.label}>Password</Text>
              <View style={{ position: 'relative', width: '100%', marginBottom: 16 }}>
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.input, { marginBottom: 0 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => scrollToInput(passwordInputRef)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Text style={{ color: Colors.inputText, fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateAccount}
              >
                <Text style={styles.createButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink} onPress={() => navigation.dispatch(StackActions.push('SignIn'))}>Login Here</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  contentBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.background,
    alignItems: 'center',
    alignSelf: 'center',
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
    color: Colors.button,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: Colors.headerText,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 8,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.headerText,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  googleButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    marginBottom: 10,
    alignSelf: 'center',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderColor, // lighter border color
  },
  orText: {
    marginHorizontal: 12,
    color: Colors.headerText,
    fontSize: 16,
  },
  form: {
    width: '100%',
    marginBottom: 10,
  },
  label: {
    color: Colors.headerText,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.inputBackground, // darker input background
    borderRadius: 8,
    paddingHorizontal: 16,
    color: Colors.inputText, // text color as #888
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    paddingRight: 40, // Add space for the eye icon
  },
  createButton: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.button, // Yellow button
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  createButtonText: {
    color: Colors.buttonText, // Dark text for contrast on yellow
    fontSize: 18,
    fontWeight: '600',
  },
  loginText: {
    color: Colors.headerText,
    fontSize: 15,
    marginTop: 0,
    marginBottom: 40,
  },
  loginLink: {
    color: Colors.button,
    fontWeight: 'bold',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});