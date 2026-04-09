import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

const types = ['All', 'Eat', 'Snack', 'Groceries', 'Laundry', 'Bensin', 'Flazz', 'Home Appliance', 'Jumat Berkah', 'Uang Sampah', 'Uang Keamanan', 'Medicine', 'Others'];
const typeEmojis = {
    Eat: '🍽️', Snack: '🍿', Groceries: '🛒', Laundry: '🧺',
    Bensin: '⛽', Flazz: '💳', 'Home Appliance': '🏠', 'Jumat Berkah': '🤲',
    'Uang Sampah': '🗑️', 'Uang Keamanan': '👮', Medicine: '💊', Others: '📦',
};

const pocketsList = ['All', 'Kwintals', 'Groceries', 'Weekday Transport', 'Weekend Transport', 'Investasi', 'Bandung', 'Sedeqah', 'IPL'];
const pocketIcons = {
    Kwintals: '💰', Groceries: '🥦', 'Weekday Transport': '🚌',
    'Weekend Transport': '🚗', Investasi: '📈', Bandung: '⛰️',
    Sedeqah: '🤲', IPL: '🏘️',
};

function Card({ children, style }) {
    return (
        <View style={[{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 16,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
        }, style]}>
            {children}
        </View>
    );
}

export default function AllTransactionsScreen({ navigation }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const [filterPocket, setFilterPocket] = useState('All');
    const [targetDate, setTargetDate] = useState(new Date());
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => { fetchTransactions(); }, [targetDate, filterType, filterPocket, sortOrder]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
            const params = { month: monthStr };
            if (filterType !== 'All') params.type = filterType;
            if (filterPocket !== 'All') params.pocket = filterPocket;
            if (sortOrder) params.sort = sortOrder;

            const response = await api.get('/api/transactions', { params });
            let data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            data = data.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => { setRefreshing(true); fetchTransactions(); };

    const handleDelete = (id) => {
        Alert.alert('Delete Transaction', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try { await api.delete(`/api/transaction/${id}`); fetchTransactions(); }
                    catch (e) { Alert.alert('Error', 'Failed to delete'); }
                },
            },
        ]);
    };

    const handlePrevMonth = () => { const d = new Date(targetDate); d.setMonth(d.getMonth() - 1); setTargetDate(d); };
    const handleNextMonth = () => { const d = new Date(targetDate); d.setMonth(d.getMonth() + 1); setTargetDate(d); };
    const toggleSort = () => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));

    const monthLabel = targetDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const totalAmount = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const formattedTotal = `Rp ${totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

    const renderChip = (item, isActive, onPress, icon) => (
        <TouchableOpacity
            key={item}
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: isActive ? '#FFF9E6' : '#F5F5F0',
                borderWidth: isActive ? 1.5 : 0,
                borderColor: isActive ? '#F5A623' : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            {icon && <Text style={{ fontSize: 12, marginRight: 4 }}>{icon}</Text>}
            <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? '#D4891A' : '#333333' }}>{item}</Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item, index }) => (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
            }}
        >
            <Text style={{ fontSize: 18, marginRight: 10 }}>{typeEmojis[item.type] || '📦'}</Text>
            <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>{item.ngapain}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666', marginTop: 2 }}>
                    {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · {item.pocket}
                </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444', marginBottom: 4 }}>- {item.formattedAmount || `Rp ${item.amount}`}</Text>
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666' }}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 20, fontWeight: '600', color: '#F5A623' }}>←</Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A' }}>Transactions</Text>
                </View>
                <TouchableOpacity
                    onPress={toggleSort}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#FFF9E6' }}
                >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#333333' }}>{sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}</Text>
                </TouchableOpacity>
            </View>

            {/* Month Nav */}
            <View style={{ paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={handlePrevMonth} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFF9E6', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#333333', fontSize: 16, fontWeight: '600' }}>‹</Text>
                </TouchableOpacity>
                <View style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#FFF9E6' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>{monthLabel}</Text>
                </View>
                <TouchableOpacity onPress={handleNextMonth} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFF9E6', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#333333', fontSize: 16, fontWeight: '600' }}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={{ paddingVertical: 4 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6 }}>
                    {types.map((t) => renderChip(t, filterType === t, () => setFilterType(t)))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6 }}>
                    {pocketsList.map((p) => renderChip(p, filterPocket === p, () => setFilterPocket(p), pocketIcons[p]))}
                </ScrollView>
            </View>

            {/* Summary */}
            <View style={{ paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#666666' }}>{transactions.length} transactions</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#EF4444' }}>{formattedTotal}</Text>
            </View>

            {/* List */}
            {loading && !refreshing ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#F5A623" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#666666', marginTop: 40 }}>No transactions found.</Text>}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" />}
                />
            )}
        </SafeAreaView>
    );
}
