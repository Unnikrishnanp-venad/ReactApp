import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HistoryItem {
	id: string;
	title: string;
	amount: number;
	date: Date;
	type: string;
	subtitle: string;
	bank: keyof typeof BANK_ICONS;
}

const MOCK_HISTORY: HistoryItem[] = [
	{
		id: '1',
		title: 'J J ENTERPRISES',
		amount: 85,
		date: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
		type: 'Paid',
		subtitle: 'Paid to',
		bank: 'hdfc',
	},
	{
		id: '2',
		title: 'Jio Prepaid Recharges',
		amount: 899,
		date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
		type: 'Paid',
		subtitle: 'Paid to',
		bank: 'hdfc',
	},
	{
		id: '3',
		title: 'J J ENTERPRISES',
		amount: 194,
		date: new Date(Date.now() - 25 * 60 * 60 * 1000), // 1 day ago
		type: 'Paid',
		subtitle: 'Paid to',
		bank: 'hdfc',
	},
	{
		id: '4',
		title: 'JJ Enterprises',
		amount: 25,
		date: new Date('2025-06-09'),
		type: 'Paid',
		subtitle: 'Paid to',
		bank: 'sbi',
	},
];

const BANK_ICONS: Record<string, any> = {
	hdfc: require('../../assets/A1.png'),
	sbi: require('../../assets/A2.png'),
};

const FILTERS = [
	{ label: 'All', value: 'all' },
	{ label: 'Paid', value: 'Paid' },
	// Add more types if needed
];

const HistoryScreen = () => {
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [search, setSearch] = useState('');
	const [filtered, setFiltered] = useState<HistoryItem[]>([]);
	const [filterType, setFilterType] = useState('all');
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		// Load from storage or use mock
		(async () => {
			const stored = await AsyncStorage.getItem('history');
			let data = stored ? JSON.parse(stored) : MOCK_HISTORY;
			// Convert date strings back to Date objects
			data = data.map((item: any) => ({ ...item, date: new Date(item.date) }));
			setHistory(data);
			setFiltered(data);
		})();
	}, []);

	useEffect(() => {
		// Filter by search and type
		let data = history;
		if (filterType !== 'all') {
			data = data.filter(item => item.type === filterType);
		}
		if (search) {
			data = data.filter(
				(item: any) =>
					item.title.toLowerCase().includes(search.toLowerCase()) ||
					(item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()))
			);
		}
		setFiltered(data);
	}, [search, history, filterType]);

	const renderItem = ({ item }: { item: HistoryItem }) => (
		<View style={styles.itemRow}>
			<View style={styles.iconBox}>
				<Text style={{ fontSize: 22, color: '#fff' }}>↗️</Text>
			</View>
			<View style={{ flex: 1 }}>
				<Text style={styles.itemSubtitle}>{item.subtitle}</Text>
				<Text style={styles.itemTitle}>{item.title}</Text>
				<Text style={styles.itemDate}>{formatDate(item.date)}</Text>
			</View>
			<View style={{ alignItems: 'flex-end' }}>
				<Text style={styles.itemAmount}>₹{item.amount}</Text>
				<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
					<Text style={styles.itemDebited}>Debited from </Text>
					{item.bank && BANK_ICONS[item.bank] && (
						<Image source={BANK_ICONS[item.bank]} style={styles.bankIcon} />
					)}
				</View>
			</View>
		</View>
	);

	function formatDate(date: Date) {
		const now = new Date();
		const diff = (now.getTime() - date.getTime()) / 1000;
		if (diff < 60 * 60 * 24) {
			// less than 1 day
			if (diff < 60 * 60) {
				const hours = Math.floor(diff / 3600);
				return hours <= 1 ? 'Just now' : `${hours} hours ago`;
			}
			const days = Math.floor(diff / (60 * 60 * 24));
			return days <= 1 ? '1 day ago' : `${days} days ago`;
		}
		// Otherwise, show date
		return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				<Text style={styles.headerTitle}>History</Text>
				<TouchableOpacity style={styles.statementBtn}>
					<Text style={styles.statementBtnText}>My Statements</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.searchRow}>
				<TextInput
					style={styles.searchInput}
					placeholder="Search transactions"
					placeholderTextColor="#888"
					value={search}
					onChangeText={setSearch}
				/>
				<TouchableOpacity onPress={() => setShowFilters(f => !f)}>
					<Image source={require('../../assets/filter.png')} style={{ width: 24, height: 24, marginRight: 18, tintColor: '#888' }} />
				</TouchableOpacity>
			</View>
			{showFilters && (
				<View style={styles.filterRow}>
					{FILTERS.map(f => (
						<TouchableOpacity
							key={f.value}
							style={[styles.filterBtn, filterType === f.value && styles.filterBtnActive]}
							onPress={() => setFilterType(f.value)}
						>
							<Text style={[styles.filterBtnText, filterType === f.value && styles.filterBtnTextActive]}>{f.label}</Text>
						</TouchableOpacity>
					))}
				</View>
			)}
			<FlatList
				data={filtered}
				keyExtractor={item => item.id}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 32 }}
				style={{ marginTop: 12 }}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#111',
		paddingHorizontal: 0,
		paddingTop: 0,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 32,
		marginBottom: 16,
		paddingHorizontal: 20,
	},
	headerTitle: {
		fontSize: 32,
		color: '#fff',
		fontWeight: 'bold',
	},
	statementBtn: {
		borderWidth: 1,
		borderColor: '#333',
		borderRadius: 24,
		paddingHorizontal: 18,
		paddingVertical: 8,
		backgroundColor: '#181818',
	},
	statementBtnText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	filterRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		marginLeft: 16,
	},
	filterBtn: {
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 16,
		backgroundColor: '#181818',
		marginRight: 10,
		borderWidth: 1,
		borderColor: '#222',
	},
	filterBtnActive: {
		backgroundColor: '#FFD600',
		borderColor: '#FFD600',
	},
	filterBtnText: {
		color: '#888',
		fontWeight: 'bold',
		fontSize: 15,
	},
	filterBtnTextActive: {
		color: '#000',
	},
	searchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#222',
		borderRadius: 32,
		marginHorizontal: 16,
		marginBottom: 12,
		height: 56,
	},
	searchInput: {
		flex: 1,
		color: '#fff',
		fontSize: 18,
		marginLeft: 18,
	},
	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#181818',
		borderRadius: 18,
		marginHorizontal: 12,
		marginBottom: 16,
		padding: 16,
	},
	iconBox: {
		width: 48,
		height: 48,
		borderRadius: 12,
		backgroundColor: '#333',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 16,
	},
	itemSubtitle: {
		color: '#aaa',
		fontSize: 14,
		marginBottom: 2,
	},
	itemTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 2,
	},
	itemDate: {
		color: '#888',
		fontSize: 13,
	},
	itemAmount: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
	},
	itemDebited: {
		color: '#888',
		fontSize: 13,
		marginRight: 4,
	},
	bankIcon: {
		width: 22,
		height: 22,
		borderRadius: 6,
		backgroundColor: '#fff',
	},
});

export default HistoryScreen;
