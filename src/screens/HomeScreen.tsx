import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import Colors from '../constants/colors';

const PLANS = [
  {
    id: '1',
    carrier: 'AT&T',
    country: 'Mexico',
    icon: require('../../assets/A1.png'),
    details: '2GB / 60min',
    validity: 'VALID FOR 24 DAYS',
    price: '$32,10',
    color: '#e3d6fa',
  },
  {
    id: '2',
    carrier: 'Vivo',
    country: 'Brazil',
    icon: require('../../assets/A2.png'),
    details: '5GB',
    validity: 'VALID FOR 30 DAYS',
    price: '$15',
    color: '#d2eaf7',
  },
  {
    id: '3',
    carrier: 'Vodafone',
    country: 'France',
    icon: require('../../assets/A3.png'),
    details: '1GB',
    validity: 'VALID FOR 12 DAYS',
    price: '$104,20',
    color: '#f7d7d7',
  },
];

const HomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top row: profile */}
      <View style={styles.topRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../../assets/A4.png')} style={styles.flixLogo} />
          <Text style={styles.flixTitle}>FLIX</Text>
        </View>
      </View>
      {/* Floating Plus Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>
      {/* Title */}
      <Text style={styles.title}>Always be{'\n'}in touch</Text>
      {/* Plans list */}
      <FlatList
        data={PLANS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.planCard, { backgroundColor: item.color }]}>
            <View style={styles.planRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={item.icon} style={styles.planIcon} />
                <Text style={styles.planCarrier}>{item.carrier}</Text>
              </View>
              <Text style={styles.planCountry}>{item.country}</Text>
            </View>
            <View style={styles.planDetailsRow}>
              <View>
                <Text style={styles.planDetails}>{item.details}</Text>
                <Text style={styles.planValidity}>{item.validity}</Text>
              </View>
              <Text style={styles.planPrice}>{item.price}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        style={{ marginTop: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // solid black
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 44,
    color: Colors.headerText,
    fontWeight: 'bold',
    marginBottom: 18,
    marginLeft: 20,
    marginTop: 8,
    lineHeight: 48,
  },
  planCard: {
    borderRadius: 28,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    resizeMode: 'contain',
  },
  planCarrier: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  planCountry: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  planDetailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  planDetails: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  planValidity: {
    fontSize: 13,
    color: Colors.inputText,
    fontWeight: '500',
  },
  planPrice: {
    fontSize: 28,
    color: '#222',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
  flixLogo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    marginRight: 8,
  },
  flixTitle: {
    fontSize: 28,
    color: Colors.button,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.button,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  fabPlus: {
    color: '#111',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: -2,
  },
});