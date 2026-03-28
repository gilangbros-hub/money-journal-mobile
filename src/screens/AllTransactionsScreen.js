import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

const types = ['All', 'Eat', 'Snack', 'Groceries', 'Laundry', 'Bensin', 'Flazz', 'Home Appliance', 'Jumat Berkah', 'Uang Sampah', 'Uang Keamanan', 'Medicine', 'Others'];
const typeEmojis = {
    'Eat': '🍽️', 'Snack': '🍿', 'Groceries': '🛒', 'Laundry': '🧺',
    'Bensin': '⛽', 'Flazz': '💳', 'Home Appliance': '🏠', 'Jumat Berkah': '🤲',
    'Uang Sampah': '🗑️', 'Uang Keamanan': '👮', 'Medicine': '💊', 'Others': '📦'
};

const pockets = ['All', 'Kwintals', 'Groceries', 'Weekday Transport', 'Weekend Transport', 'Investasi', 'Bandung', 'Sedeqah', 'IPL'];
const pocketIcons = {
    'Kwintals': '💰', 'Groceries': '🥦', 'Weekday Transport': '🚌',
    'Weekend Transport': '🚗', 'Investasi': '📈', 'Bandung': '⛰️',
    'Sedeqah': '🤲', 'IPL': '🏘️'
};

export default function AllTransactionsScreen({ navigation }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const [filterPocket, setFilterPocket] = useState('All');
    const [targetDate, setTargetDate] = useState(new Date());
    const [sortOrder, setSortOrder] = useState('desc'); 

    useEffect(() => {
        fetchTransactions();
    }, [targetDate, filterType, filterPocket, sortOrder]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
            const params = { month: monthStr };
            if (filterType !== 'All') params.type = filterType;
            if (filterPocket !== 'All') params.pocket = filterPocket;
            if (sortOrder) params.sort = sortOrder;
            
            const response = await api.get('/api/transactions', { params });
            
            // Backend returns a flat array from GET /api/transactions
            let data = [];
            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                data = response.data.data;
            }
            
            data = data.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });

            setTransactions(data);
        } catch (error) {
            console.error('Error fetching all transactions', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTransactions();
    };

    const handleDelete = async (id) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/api/transaction/${id}`);
                            fetchTransactions();
                        } catch (e) {
                            Alert.alert("Error", "Failed to delete");
                        }
                    }
                }
            ]
        );
    }

    const handlePrevMonth = () => {
        const newDate = new Date(targetDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setTargetDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(targetDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setTargetDate(newDate);
    };

    const toggleSort = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    const monthLabel = targetDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    const totalAmount = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const formattedTotal = `Rp ${totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

    const renderItem = ({ item }) => (
        <View className="bg-bg-secondary p-4 rounded-2xl flex-row items-center mb-3 shadow-sm border border-border/50">
            <View className="w-12 h-12 bg-bg-tertiary rounded-xl items-center justify-center mr-3">
                <Text className="text-[22px]">{typeEmojis[item.type] || '📦'}</Text>
            </View>
            <View className="flex-1 mr-2">
                <Text className="text-text-primary font-bold text-[14px] mb-1">{item.ngapain}</Text>
                <Text className="text-text-muted text-[12px] font-medium">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {item.pocket}</Text>
            </View>
            <View className="items-end">
                <Text className="text-coral font-bold text-[14px] mb-1.5">- {item.formattedAmount || `Rp ${item.amount}`}</Text>
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                    <Text className="text-text-muted text-[11px] underline">Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            {/* Header */}
            <View className="px-5 py-3 flex-row items-center justify-between border-b border-border/50 bg-bg z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-5 py-1">
                        <Text className="text-primary text-[22px] font-bold">←</Text>
                    </TouchableOpacity>
                    <Text className="text-[20px] font-bold text-text-primary">Transactions</Text>
                </View>
                <TouchableOpacity onPress={toggleSort} className="bg-bg-secondary px-3 py-1.5 rounded-full border border-border/50">
                    <Text className="text-text-primary text-xs font-bold">{sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}</Text>
                </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View className="px-5 py-2 flex-row items-center justify-between z-10">
                <TouchableOpacity onPress={handlePrevMonth} className="w-10 h-10 bg-bg-secondary rounded-xl items-center justify-center border border-border/50">
                    <Text className="text-text-secondary text-lg font-bold">←</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-text-primary">{monthLabel}</Text>
                <TouchableOpacity onPress={handleNextMonth} className="w-10 h-10 bg-bg-secondary rounded-xl items-center justify-center border border-border/50">
                    <Text className="text-text-secondary text-lg font-bold">→</Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View className="py-2 border-b border-border/50">
                {/* Type Filter */}
                <View className="mb-2">
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={types}
                        keyExtractor={item => `type-${item}`}
                        contentContainerStyle={{ paddingLeft: 20 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                onPress={() => setFilterType(item)}
                                className={`px-5 py-2 rounded-full mr-3 border ${filterType === item ? 'bg-primary/20 border-primary' : 'bg-bg-secondary border-border/50'}`}
                            >
                                <Text className={`font-bold text-[13px] ${filterType === item ? 'text-primary' : 'text-text-secondary'}`}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
                
                {/* Pocket Filter */}
                <View>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={pockets}
                        keyExtractor={item => `pocket-${item}`}
                        contentContainerStyle={{ paddingLeft: 20 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                onPress={() => setFilterPocket(item)}
                                className={`px-5 py-2 rounded-full mr-3 border ${filterPocket === item ? 'bg-primary/20 border-primary shadow-sm' : 'bg-bg-secondary border-border/50'}`}
                            >
                                <View className="flex-row items-center gap-1.5">
                                    {pocketIcons[item] && <Text className="text-[14px]">{pocketIcons[item]}</Text>}
                                    <Text className={`font-bold text-[13px] ${filterPocket === item ? 'text-primary' : 'text-text-secondary'}`}>{item}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>

            {/* Summary Bar */}
            <View className="px-5 py-3 flex-row justify-between items-center bg-bg-secondary border-b border-border/50 mb-2">
                <Text className="text-text-secondary font-medium text-[13px]">{transactions.length} Transactions</Text>
                <Text className="text-coral font-bold text-[15px]">{formattedTotal}</Text>
            </View>

            {/* List */}
            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#7C3AED" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={item => item._id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    ListEmptyComponent={<Text className="text-center text-text-muted mt-10">No transactions found.</Text>}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
                />
            )}
        </SafeAreaView>
    );
}
