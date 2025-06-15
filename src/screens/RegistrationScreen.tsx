import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Keyboard, findNodeHandle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/colors';
import { StackActions } from '@react-navigation/native';
import { ScreenNames } from '../constants/screenNames';
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { IOS_CLIENT_ID, StorageKeys, WEB_CLIENT_ID } from '../constants/key';
import { googleSignIn } from '../constants/googleSigIn';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
const { width } = Dimensions.get('window');
import Toast, { ToastPosition, ToastType } from 'react-native-toast-message';
import FontSize from '../constants/fontsize';

const RegistrationScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailY, setEmailY] = useState(0);
    const [passwordY, setPasswordY] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const scrollViewRef = React.useRef<ScrollView>(null);
    const emailInputRef = React.useRef<TextInput | null>(null);
    const passwordInputRef = useRef<TextInput | null>(null);

    const scrollToInput = (y: number) => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: Math.max(y - 40, 0), animated: true });
        }, 100);
    };
    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 0, animated: true });
            }
        });
        return () => keyboardDidHideListener.remove();
    }, []);

    const handleRegister = async () => {
        if (!email || !password) {
            showErrorToast(
                'error',
                'bottom',
                'Enter Details',
                'Please enter an email and password');
            return;
        }
        setLoading(true);
        const start = Date.now();
        createUserWithEmailAndPassword(getAuth(), email, password)
            .then(() => {
                AsyncStorage.setItem(StorageKeys.IS_AUTHED, 'true');
                AsyncStorage.setItem(StorageKeys.SIGN_IN_TYPE, 'firebase');
                AsyncStorage.setItem(StorageKeys.GOOGLE_USER_NAME, email); // Store email as name
                AsyncStorage.setItem(StorageKeys.GOOGLE_USER_EMAIL, email); // Store email
                let user = getAuth().currentUser;
                const elapsed = Date.now() - start;
                const delay = Math.max(2000 - elapsed, 0);
                setTimeout(() => {
                    setLoading(false);
                    navigation.dispatch(StackActions.replace(ScreenNames.HOME_TABS)); // Navigate to Home screen
                }, delay);
            })
            .catch(error => {
                AsyncStorage.setItem(StorageKeys.IS_AUTHED, 'false');
                if (error.code === 'auth/email-already-in-use') {
                    showErrorAlert(
                        'Email Already in Use',
                        'That email address is already in use! Please try a different one.'
                    );
                    console.log('That email address is already in use!');

                }
                if (error.code === 'auth/invalid-email') {
                      showErrorAlert(
                        'Invalid Email',
                        'That email address is invalid! Please enter a valid email address.'
                    );
                    console.log('That email address is invalid!');
                }
                setLoading(false);
            });
    };

    if (loading) {
        return (
            <View style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 10,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Colors.background,
            }} pointerEvents="box-none">
                <View style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: Colors.background,
                    // Use backdropFilter for web, and fallback for native
                    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(6px)' } : {}),
                }} />
                <View style={{ backgroundColor: Colors.background, borderRadius: 12, padding: 24, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={{ color: Colors.inputText, marginTop: 12, fontSize: 16 }}>Please wait...</Text>
                </View>
            </View>
        );
    }

    GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        forceCodeForRefreshToken: false,
        iosClientId: IOS_CLIENT_ID,
    });
    const showErrorAlert = async (title: string, message: string) => {
        Alert.alert(
            title,
            message,
            [
                { text: 'Ok', style: 'default' },
            ]
        );
    };
    const showErrorToast = async (type:ToastType,position:ToastPosition,title: string, message: string) => {
        Toast.show({
                    type: type,
                    text1: title,
                    text2: message,
                    position: position,
                  visibilityTime: 3000,
            });
    };
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
                        <Text style={styles.title}>Register your account</Text>
                        <Text style={styles.subtitle}>Sign up to start your 30 days free trial</Text>
                        <GoogleSigninButton
                            style={styles.googleButton}
                            size={GoogleSigninButton.Size.Wide}
                            color={GoogleSigninButton.Color.Dark}
                            onPress={() => {
                                setLoading(true);
                                googleSignIn(
                                    () => {
                                        AsyncStorage.setItem(StorageKeys.IS_AUTHED, 'true');
                                        AsyncStorage.setItem('signInType', 'google');
                                        navigation.dispatch(StackActions.replace(ScreenNames.HOME_TABS));
                                    },
                                    (error) => {
                                        setLoading(false);
                                        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                                            console.log('error occured SIGN_IN_CANCELLED');
                                        } else if (error.code === statusCodes.IN_PROGRESS) {
                                            console.log('error occured IN_PROGRESS');
                                        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                                            console.log('error occured PLAY_SERVICES_NOT_AVAILABLE');
                                        } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
                                            console.log('error occured SIGN_IN_REQUIRED');
                                        } else {
                                            console.log(error);
                                            console.log('error occured unknow error');
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
                            <Text style={styles.subtitle}>Enter your details below</Text>
                            <TextInput
                                ref={emailInputRef}
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="#888"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => scrollToInput(emailY)}
                                onLayout={e => setEmailY(e.nativeEvent.layout.y)}
                            />
                            <View style={{ position: 'relative', width: '100%', marginBottom: 16 }}>
                                <TextInput
                                    ref={passwordInputRef}
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Password"
                                    placeholderTextColor={Colors.inputText}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => scrollToInput(passwordY)}
                                    onLayout={e => setPasswordY(e.nativeEvent.layout.y)}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                                    <Image
                                        source={showPassword ? require('../../assets/eye_open.png') : require('../../assets/eye_closed.png')}
                                        style={{ width: 24, height: 24, tintColor: Colors.inputText }}
                                    />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleRegister}
                            >
                                <Text style={styles.createButtonText}>Register</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginLink} onPress={() => navigation.dispatch(StackActions.push(ScreenNames.SIGN_IN))}>Login Here</Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

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
        fontSize: FontSize.xxxhuge,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    title: {
        fontSize: FontSize.xxxhuge,
        fontWeight: 'bold',
        color: Colors.primaryText,
        textAlign: 'left',
        alignSelf: 'flex-start',
        marginBottom: 8,
        marginTop: 8,
        lineHeight: 44,
    },
    subtitle: {
        fontSize: FontSize.large,
        color: Colors.inputText,
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    form: {
        width: '100%',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        height: 48,
        backgroundColor: Colors.inputBackground,
        borderRadius: 8,
        paddingHorizontal: 16,
        color: Colors.inputText,
        fontSize: FontSize.large,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        paddingRight: 40,
    },
    createButton: {
        width: '100%',
        height: 48,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
    },
    createButtonText: {
        color: Colors.buttonText,
        fontSize: FontSize.large,
        fontWeight: '600',
    },
    loginText: {
        color: Colors.inputText,
        fontSize: FontSize.medium,
        marginTop: 10,
        marginBottom: 40,
    },
    loginLink: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: Colors.borderColor,
    },
    orText: {
        marginHorizontal: 12,
        color: Colors.primaryText,
        fontSize: FontSize.large,
    },
});

export default RegistrationScreen;
