import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

const types = ['All', 'Eat', 'Snack', 'Groceries', 'Laundry', 'Bensin', 'Flazz', 'Home Appliance', 'Jumat Berkah', 'Uang Sampah', 'Uang Keamanan', 'Medicine', 'Others'];
const typeEmojis = {
    'Eat': '🍽️', 'Snack': '🍿', 'Groceries': '🛒', 'Laundry': '🧺',
    'Bensin': '⛽', 'Flazz': '💳', 'Home Appliance': '🏠', 'Jumat Berkah': '🤲',
    'Uang Sampah': '🗑️', 'Uang Keamanan': '👮', 'Medicine': '💊', 'Others': '📦'
};

export default function AllTransactionsScreen({ navigation }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All');

    const today = new Date();
    const [month, setMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);

    useEffect(() => {
        fetchTransactions();
    }, [month, filterType]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = { month };
            if (filterType !== 'All') params.type = filterType;
            
            const response = await api.get('/api/transactions', { params });
            if (response.data && response.data.data) {
                setTransactions(response.data.data);
            } else if (Array.isArray(response.data)) {
                 setTransactions(response.data);
            }
        } catch (error) {
            console.error('Error fetching all transactions', error);
        } finally {
            setLoading(false);
        }
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
            <View className="px-5 py-3 flex-row items-center border-b border-border/50 bg-bg z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-5 py-1">
                    <Text className="text-primary text-[22px] font-bold">←</Text>
                </TouchableOpacity>
                <Text className="text-[20px] font-bold text-text-primary">All Transactions</Text>
            </View>

            {/* Filters */}
            <View className="py-4 pl-5 border-b border-border/50">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={types}
                    keyExtractor={item => item}
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

            {/* List */}
            {loading ? (
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
                />
            )}
        </SafeAreaView>
    );
}
