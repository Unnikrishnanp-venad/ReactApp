import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Image } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignInScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            console.log('SignIn attempt failed: missing email or password');
            return;
        }
        console.log('Attempting sign in with:', email);
        signInWithEmailAndPassword(getAuth(), email, password)
            .then(() => {
                let user = getAuth().currentUser;
                AsyncStorage.setItem('isAuthed', 'true');
                AsyncStorage.setItem('signInType', 'firebase'); // Store sign-in type
                console.log('User account created & signed in!', user);
                navigation.replace('Home');
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
            });
    };

    return (
        <View style={styles.container}>
            {/* Back button if navigated from AuthScreen */}
            {navigation.canGoBack() && (
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>{'Back'}</Text>
                </TouchableOpacity>
            )}
            {/* Branding/logo row */}
            <View style={styles.header}>
                <Image source={require('../../assets/A4.png')} style={styles.logo} />
                <Text style={styles.brand}>FLIX</Text>
            </View>
            {/* Large subtitle */}
            <Text style={styles.bigSubtitle}>Keep your online{Platform.OS === 'web' ? '\n' : ' '}business organized</Text>
            <Text style={styles.trialSubtitle}>Sign up to start your 30 days free trial</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Enter your details below</Text>
            <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <View style={styles.passwordRow}>
                <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Text style={{ color: '#888', fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                <Text style={styles.signInButtonText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Forgot password pressed')}>
                <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>
            {/* Removed Google sign-in button from SignInScreen */}
            {/* <View style={styles.socialRow}>
                <GoogleSigninButton ... />
            </View> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // dark background
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 12,
        marginTop: 8,
    },
    logo: {
        width: 36,
        height: 36,
        marginRight: 8,
        resizeMode: 'contain',
    },
    brand: {
        fontSize: 28,
        color: '#FFD600',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    bigSubtitle: {
        fontSize: 36,
        color: '#888', // text color as #888
        fontWeight: 'bold',
        marginBottom: 0,
        alignSelf: 'flex-start',
        lineHeight: 40,
    },
    trialSubtitle: {
        fontSize: 18,
        color: '#888', // text color as #888
        marginBottom: 32,
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: 32,
        color: '#888', // text color as #888
        fontWeight: 'bold',
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    subtitle: {
        fontSize: 16,
        color: '#888', // text color as #888
        marginBottom: 24,
        alignSelf: 'flex-start',
    },
    input: {
        width: '100%',
        height: 48,
        backgroundColor: '#232323', // darker input background
        borderRadius: 8,
        paddingHorizontal: 16,
        color: '#888', // text color as #888
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
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
        backgroundColor: '#FFD600', // darker button
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    signInButtonText: {
        color: '#000', // text color as #888
        fontSize: 18,
        fontWeight: '600',
    },
    forgotText: {
        color: '#888', // text color as #888
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
        backgroundColor: '#333', // darker line
    },
    orText: {
        marginHorizontal: 12,
        color: '#888', // text color as #888
        fontSize: 15,
    },
    socialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    googleButton: {
        flex: 1,
        height: 48,
        marginRight: 8,
    },
    fbButton: {
        width: 48,
        height: 48,
        backgroundColor: '#232323', // darker button
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fbText: {
        color: '#888', // text color as #888
        fontSize: 28,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 48,
        left: 24,
        zIndex: 10,
        padding: 8,
    },
    backButtonText: {
        color: '#FFD600',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default SignInScreen;
