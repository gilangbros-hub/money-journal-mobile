import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/axios';

const types = [
    { name: 'Eat', icon: '🍽️' }, { name: 'Snack', icon: '🍿' }, { name: 'Groceries', icon: '🛒' },
    { name: 'Laundry', icon: '🧺' }, { name: 'Bensin', icon: '⛽' }, { name: 'Flazz', icon: '💳' },
    { name: 'Home Appliance', icon: '🏠' }, { name: 'Jumat Berkah', icon: '🤲' }, 
    { name: 'Uang Sampah', icon: '🗑️'}, { name: 'Uang Keamanan', icon: '👮'}, 
    { name: 'Medicine', icon: '💊' }, { name: 'Others', icon: '📦' }
];

const pockets = ['BCA', 'Mandiri', 'Cash', 'BNI', 'GoPay', 'OVO'];
const paidBys = [{ name: 'Gilang', icon: '👦' }, { name: 'Revo', icon: '👱‍♂️' }, { name: 'Split', icon: '✂️' }];

export default function AddTransactionScreen({ navigation }) {
    const [amount, setAmount] = useState('');
    const [ngapain, setNgapain] = useState('');
    const [type, setType] = useState('Eat');
    const [pocket, setPocket] = useState('BCA');
    const [paidBy, setPaidBy] = useState('Gilang');
    
    // Date handling
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const handleSave = async () => {
        if (!amount || !ngapain) {
            Alert.alert('Error', 'Please fill in the Amount and Notes (Ngapain) fields.');
            return;
        }

        setLoading(true);
        try {
            // Backend expects specific date format depending on the original implementation
            // The HTML was an <input type="date"> which submits YYYY-MM-DD
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            const payload = {
                amount: parseInt(amount.replace(/[^0-9]/g, ''), 10),
                ngapain,
                type,
                pocket,
                paidBy,
                date: formattedDate
            };

            await api.post('/api/transaction', payload);
            Alert.alert('Success', 'Transaction saved successfully!', [
                { text: 'OK', onPress: () => {
                    // Reset form or navigate
                    setAmount('');
                    setNgapain('');
                    navigation.navigate('Dashboard');
                }}
            ]);
        } catch (error) {
            console.error('Save error', error);
            Alert.alert('Error', 'Failed to save transaction.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                {/* Header */}
                <View className="px-5 py-3 mb-2 flex-row justify-between items-center z-10 border-b border-border/50 bg-bg">
                    <Text className="text-[20px] font-bold text-text-primary">Add Transaction</Text>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} className="flex-1" showsVerticalScrollIndicator={false}>
                    
                    {/* Amount */}
                    <View className="mt-4 mb-5">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Amount (Rp)</Text>
                        <TextInput
                            className="w-full bg-bg-secondary text-lime py-4 px-5 rounded-2xl text-2xl font-extrabold border border-border/50"
                            placeholder="0"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>

                    {/* Notes (Ngapain) */}
                    <View className="mb-5">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Notes (Ngapain)</Text>
                        <TextInput
                            className="w-full bg-bg-secondary text-text-primary py-4 px-5 rounded-2xl text-[15px] border border-border/50"
                            placeholder="Lunch at mall..."
                            placeholderTextColor="#94A3B8"
                            value={ngapain}
                            onChangeText={setNgapain}
                        />
                    </View>

                    {/* Date Picker */}
                    <View className="mb-6">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Date</Text>
                        <TouchableOpacity 
                            className="bg-bg-secondary py-4 px-5 rounded-2xl border border-border/50 flex-row items-center"
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text className="text-[18px] mr-3">📅</Text>
                            <Text className="text-text-primary font-bold">{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>

                    {/* Type/Category */}
                    <View className="mb-6">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Category</Text>
                        <View className="flex-row flex-wrap justify-between gap-y-3">
                            {types.map((t) => (
                                <TouchableOpacity 
                                    key={t.name}
                                    onPress={() => setType(t.name)}
                                    className={`w-[31%] aspect-square rounded-2xl items-center justify-center border ${type === t.name ? 'bg-primary/20 border-primary' : 'bg-bg-secondary border-border/50'}`}
                                >
                                    <Text className="text-3xl mb-1">{t.icon}</Text>
                                    <Text className={`text-[10px] text-center font-bold px-1 ${type === t.name ? 'text-primary' : 'text-text-secondary'}`} numberOfLines={1}>{t.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Pocket */}
                    <View className="mb-6">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Pocket</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {pockets.map((p) => (
                                <TouchableOpacity 
                                    key={p}
                                    onPress={() => setPocket(p)}
                                    className={`px-6 py-3 rounded-xl mr-3 border ${pocket === p ? 'bg-primary/20 border-primary' : 'bg-bg-secondary border-border/50'}`}
                                >
                                    <Text className={`font-bold ${pocket === p ? 'text-primary' : 'text-text-secondary'}`}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Paid By */}
                    <View className="mb-6">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Paid By</Text>
                        <View className="flex-row justify-between">
                            {paidBys.map((pb) => (
                                <TouchableOpacity 
                                    key={pb.name}
                                    onPress={() => setPaidBy(pb.name)}
                                    className={`w-[31%] py-4 rounded-xl items-center border ${paidBy === pb.name ? 'bg-primary/20 border-primary' : 'bg-bg-secondary border-border/50'}`}
                                >
                                    <Text className="text-2xl mb-1">{pb.icon}</Text>
                                    <Text className={`font-bold text-xs ${paidBy === pb.name ? 'text-primary' : 'text-text-secondary'}`}>{pb.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Sticky Submit Button */}
            <View className="absolute bottom-[80px] left-5 right-5 z-[100]">
                <TouchableOpacity 
                    className="w-full bg-primary rounded-2xl h-14 items-center justify-center flex-row shadow-glow-primary"
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-white font-bold text-[15px]">Save Transaction</Text>
                    )}
                </TouchableOpacity>
            </View>
            
        </SafeAreaView>
    );
}
