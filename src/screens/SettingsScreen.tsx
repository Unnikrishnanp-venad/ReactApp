import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '../constants/googleSigIn';
import { firebaseSignOut } from '../constants/firebase';
import Colors from '../constants/colors';
import { StorageKeys } from '../constants/storageKeys';
import { ScreenNames } from '../constants/screenNames';

const SettingsScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<{ name?: string; email?: string; photo?: string }>({});

  useEffect(() => {
    const fetchUser = async () => {
      const name = await AsyncStorage.getItem('googleUserName');
      const email = await AsyncStorage.getItem('googleUserEmail');
      const photo = await AsyncStorage.getItem('googleUserPhoto');
      setUser({
        name: name || undefined,
        email: email || undefined,
        photo: photo || undefined,
      });
    };
    fetchUser();
  }, []);

  // Utility function to clear authentication-related AsyncStorage keys
  const clearAuthStorage = async () => {
    try {
      await AsyncStorage.removeItem(StorageKeys.IS_AUTHED);
      await AsyncStorage.removeItem(StorageKeys.SIGN_IN_TYPE);
      await AsyncStorage.removeItem(StorageKeys.GOOGLE_USER_NAME);
      await AsyncStorage.removeItem(StorageKeys.GOOGLE_USER_EMAIL);
      await AsyncStorage.removeItem(StorageKeys.GOOGLE_USER_PHOTO);
      // Add any other keys you want to clear on sign out
    } catch (e) {
      console.error('Error clearing auth storage:', e);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const signInType = await AsyncStorage.getItem(StorageKeys.SIGN_IN_TYPE);
            if (signInType === 'google') {
              // Google sign out
              await signOut(); // from googleSigIn
              console.log('Signed out from Google');
            } else if (signInType === 'firebase') {
              // Firebase sign out
              await firebaseSignOut();
              console.log('Signed out from Firebase');
            } else {
              // Fallback: try both
              await firebaseSignOut();
              await signOut();
              console.log('Signed out from both (fallback)');
            }
            await clearAuthStorage(); // Clear auth-related data
            navigation.replace(ScreenNames.AUTH);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.header }}>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          {user.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#333' }]} />
          )}
          <Text style={styles.name}>{user.name || 'User'}</Text>
          <Text style={styles.email}>{user.email || ''}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    backgroundColor: Colors.background,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: '#222',
  },
  name: {
    color: Colors.headerText,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  email: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#5f6dff',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

export default SettingsScreen;