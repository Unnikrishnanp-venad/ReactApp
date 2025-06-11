import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '../constants/googleSigIn';
import { firebaseSignOut } from '../constants/firebase';

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
            const signInType = await AsyncStorage.getItem('signInType');
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
            await AsyncStorage.clear(); // Clear all saved data
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  return (
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
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
    color: '#fff',
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