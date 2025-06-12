import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, SafeAreaView } from 'react-native';
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import Colors from '../constants/colors';

const RegistrationScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');

  const handleSignIn = () => {
    // Handle registration logic here
    // You can add validation and API call as needed
    Alert.alert('Registration Info', `Username: ${username}\nPassword: ${password}\nDOB: ${dob}\nEmail: ${email}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.header }}>
      <View style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Register</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (YYYY-MM-DD)"
              placeholderTextColor="#aaa"
              value={dob}
              onChangeText={setDob}
            />
            <TextInput
              style={styles.input}
              placeholder="Email ID"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    color: Colors.headerText,
    fontWeight: 'bold',
    marginBottom: 32,
    marginTop: 32,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 18,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#5f6dff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RegistrationScreen;