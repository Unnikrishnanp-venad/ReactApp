import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Image, SafeAreaView, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/colors';
import { StackActions } from '@react-navigation/native';

const SignInScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailY, setEmailY] = useState(0);
    const [passwordY, setPasswordY] = useState(0);
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const emailInputRef = useRef<TextInput | null>(null);
    const passwordInputRef = useRef<TextInput | null>(null);

    // Helper to scroll to input
    const scrollToInput = (y: number) => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: Math.max(y - 40, 0), animated: true });
        }, 100);
    };

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            console.log('SignIn attempt failed: missing email or password');
            return;
        }
        setLoading(true);
        console.log('Attempting sign in with:', email);
        signInWithEmailAndPassword(getAuth(), email, password)
            .then(() => {
                let user = getAuth().currentUser;
                AsyncStorage.setItem('isAuthed', 'true');
                AsyncStorage.setItem('signInType', 'firebase'); // Store sign-in type
                console.log('User account created & signed in!', user);
                navigation.dispatch(StackActions.replace('Home'));

            })
            .catch(error => {
                AsyncStorage.setItem('isAuthed', 'false');
                console.log('SignIn error:', error);
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
                    <ActivityIndicator size="large" color={Colors.button} />
                    <Text style={{ color: Colors.inputText, marginTop: 12, fontSize: 16 }}>Please wait...</Text>
                </View>
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
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.contentBox}>
                        <View style={styles.header}>
                            <Image source={require('../../assets/A4.png')} style={styles.logo} />
                            <Text style={styles.brand}>FLIX</Text>
                        </View>
                        <Text style={styles.bigSubtitle}>Keep your online{Platform.OS === 'web' ? '\n' : ' '}business organized</Text>

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
                        <View style={styles.passwordRow}>
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
                                <Text style={{ color: Colors.inputText, fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                            <Text style={styles.signInButtonText}>Sign in</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.dispatch(StackActions.popTo('Auth'))}>
                            <Text style={styles.forgotText}>Create account?</Text>
                        </TouchableOpacity>
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
        alignSelf: 'flex-start', // Align header to the left
        marginBottom: 10,
        marginTop: 0, // Add more top margin to push header below back button
    },
    logo: {
        width: 36,
        height: 36,
        marginRight: 8,
        resizeMode: 'contain',
    },
    brand: {
        fontSize: 28,
        color: Colors.button,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    bigSubtitle: {
        fontSize: 48,
        color: Colors.headerText, // text color as #888
        fontWeight: 'bold',
        marginBottom: 30,
        alignSelf: 'flex-start',
        lineHeight: 52, // Fix: lineHeight should be >= fontSize
    },
    trialSubtitle: {
        fontSize: 18,
        color: Colors.headerText, // text color as #888
        marginBottom: 32,
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: 32,
        color: Colors.headerText, // text color as #888
        fontWeight: 'bold',
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.inputText, // text color as #888
        marginBottom: 24,
        alignSelf: 'flex-start',
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
        borderColor: Colors.borderColor, // subtle border color
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInButton: {
        width: '100%',
        height: 48,
        backgroundColor: Colors.button, // darker button
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    signInButtonText: {
        color: Colors.buttonText, // text color as #888
        fontSize: 18,
        fontWeight: '600',
    },
    forgotText: {
        color: Colors.headerText, // text color as #888
        fontSize: 15,
        marginBottom: 24,
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
        backgroundColor: Colors.borderColor, // darker line
    },
    orText: {
        marginHorizontal: 12,
        color: Colors.inputText, // text color as #888
        fontSize: 15,
    },

    googleButton: {
        flex: 1,
        height: 48,
        marginRight: 8,
    },

});

export default SignInScreen;
