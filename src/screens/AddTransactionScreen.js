import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native';
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

const pockets = [
    { name: 'Kwintals', icon: '💰' }, { name: 'Groceries', icon: '🥦' },
    { name: 'Weekday Transport', icon: '🚌' }, { name: 'Weekend Transport', icon: '🚗' },
    { name: 'Investasi', icon: '📈' }, { name: 'Bandung', icon: '⛰️' },
    { name: 'Sedeqah', icon: '🤲' }, { name: 'IPL', icon: '🏘️' }
];

const celebrationMessages = [
    { emoji: '🎉', text: 'Great job tracking!' },
    { emoji: '💪', text: 'Discipline = Freedom!' },
    { emoji: '🔥', text: "You're on fire!" },
    { emoji: '✨', text: 'Every Rupiah counts!' },
    { emoji: '🏆', text: 'Champion move!' },
    { emoji: '📊', text: 'Data is power!' },
    { emoji: '🚀', text: 'Finances on track!' },
    { emoji: '💎', text: 'Smart money move!' }
];

const getBudgetMonths = () => {
    const dates = [];
    const now = new Date();
    for (let i = -1; i <= 1; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        dates.push({
            label: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
            value: { month: d.getMonth() + 1, year: d.getFullYear() }
        });
    }
    return dates;
};

export default function AddTransactionScreen({ navigation }) {
    const budgetMonthsList = getBudgetMonths();

    const [amount, setAmount] = useState('');
    const [ngapain, setNgapain] = useState('');
    const [type, setType] = useState('Eat');
    const [pocket, setPocket] = useState('Kwintals');
    const [budgetMonth, setBudgetMonth] = useState(budgetMonthsList[1]);
    
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    // Closed pockets tracking
    const [closedPockets, setClosedPockets] = useState([]);

    // Success modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState({ emoji: '🎉', text: '' });

    useEffect(() => {
        fetchClosedPockets();
    }, [budgetMonth]);

    const fetchClosedPockets = async () => {
        try {
            const monthStr = `${budgetMonth.value.year}-${String(budgetMonth.value.month).padStart(2, '0')}`;
            const response = await api.get('/api/budget', { params: { month: monthStr } });
            if (response.data?.data?.pockets) {
                const closed = response.data.data.pockets
                    .filter(p => p.closed)
                    .map(p => p.pocket);
                setClosedPockets(closed);
                // If currently selected pocket is closed, deselect
                if (closed.includes(pocket)) {
                    const firstOpen = pockets.find(p => !closed.includes(p.name));
                    if (firstOpen) setPocket(firstOpen.name);
                }
            }
        } catch (err) {
            // silently ignore
        }
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const resetForm = () => {
        setAmount('');
        setNgapain('');
        setType('Eat');
        const firstOpen = pockets.find(p => !closedPockets.includes(p.name));
        setPocket(firstOpen ? firstOpen.name : 'Kwintals');
        setBudgetMonth(budgetMonthsList[1]);
        setDate(new Date());
    };

    const handleSave = async () => {
        if (!amount || !ngapain) {
            Alert.alert('Error', 'Please fill in the Amount and Notes (Ngapain) fields.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                amount: parseInt(amount.replace(/[^0-9]/g, ''), 10),
                ngapain,
                type,
                pocket,
                budgetMonth: budgetMonth.value.month,
                budgetYear: budgetMonth.value.year,
                date: date.toISOString()
            };

            await api.post('/api/transaction', payload);

            // Pick random celebration
            const msg = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
            setSuccessMsg(msg);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Save error', error);
            const errMsg = error.response?.data?.message || 'Failed to save transaction.';
            Alert.alert('Error', errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAnother = () => {
        setShowSuccessModal(false);
        resetForm();
    };

    const handleGoHome = () => {
        setShowSuccessModal(false);
        resetForm();
        navigation.navigate('Dashboard');
    };

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                {/* Header */}
                <View className="px-5 py-3 flex-row justify-between items-center z-10 border-b border-border/50 bg-bg">
                    <Text className="text-[20px] font-bold text-text-primary">Add Transaction</Text>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }} className="flex-1" showsVerticalScrollIndicator={false}>
                    
                    {/* 1. Expense Type — 3 columns */}
                    <View className="mt-3 mb-4">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Expense Type</Text>
                        <View className="flex-row flex-wrap justify-between gap-y-2">
                            {types.map((t) => (
                                <TouchableOpacity 
                                    key={t.name}
                                    onPress={() => setType(t.name)}
                                    className={`w-[31%] py-3 rounded-2xl items-center justify-center border ${type === t.name ? 'bg-primary/20 border-primary' : 'bg-bg-secondary border-border/50'}`}
                                >
                                    <Text className="text-2xl mb-1">{t.icon}</Text>
                                    <Text className={`text-[10px] text-center font-bold px-1 ${type === t.name ? 'text-primary' : 'text-text-secondary'}`} numberOfLines={1}>{t.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 2. Notes */}
                    <View className="mb-4">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Description (Notes)</Text>
                        <TextInput
                            className="w-full bg-bg-secondary text-text-primary py-3.5 px-5 rounded-2xl text-[15px] border border-border/50"
                            placeholder="What did you buy?"
                            placeholderTextColor="#94A3B8"
                            value={ngapain}
                            onChangeText={setNgapain}
                        />
                    </View>

                    {/* 3. Amount */}
                    <View className="mb-4">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Amount</Text>
                        <View className="w-full bg-bg-secondary flex-row items-center py-3.5 px-5 rounded-2xl border border-border/50">
                            <Text className="text-primary font-extrabold text-2xl mr-2">Rp</Text>
                            <TextInput
                                className="flex-1 text-text-primary text-2xl font-extrabold"
                                placeholder="0"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>
                    </View>

                    {/* 4. Date & Time */}
                    <View className="mb-4">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Date & Time</Text>
                        <TouchableOpacity 
                            className="bg-bg-secondary py-3.5 px-5 rounded-2xl border border-border/50 flex-row items-center"
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text className="text-[18px] mr-3">📅</Text>
                            <Text className="text-text-primary font-bold">
                                {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>

                    {/* 5. Pocket Source — 3 columns, closed pockets disabled */}
                    <View className="mb-4">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Pocket Source</Text>
                        <View className="flex-row flex-wrap justify-between gap-y-2">
                            {pockets.map((p) => {
                                const isClosed = closedPockets.includes(p.name);
                                return (
                                    <TouchableOpacity 
                                        key={p.name}
                                        onPress={() => !isClosed && setPocket(p.name)}
                                        disabled={isClosed}
                                        style={isClosed ? { opacity: 0.35 } : {}}
                                        className={`w-[31%] py-3 rounded-2xl items-center justify-center border ${isClosed ? 'bg-bg-tertiary border-border/30' : pocket === p.name ? 'bg-primary/20 border-primary' : 'bg-bg-secondary border-border/50'}`}
                                    >
                                        <Text className="text-2xl mb-1">{isClosed ? '🔒' : p.icon}</Text>
                                        <Text className={`text-[9px] text-center font-bold px-1 ${isClosed ? 'text-text-muted' : pocket === p.name ? 'text-primary' : 'text-text-secondary'}`} numberOfLines={2}>{p.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* 6. Budget Month */}
                    <View className="mb-4">
                        <Text className="text-text-secondary font-medium text-[13px] mb-2">Budget Month</Text>
                        <View className="flex-row justify-between">
                            {budgetMonthsList.map((bm) => (
                                <TouchableOpacity 
                                    key={bm.label}
                                    onPress={() => setBudgetMonth(bm)}
                                    className={`w-[31%] py-3 rounded-xl items-center border ${budgetMonth.label === bm.label ? 'bg-primary/20 border-primary' : 'bg-bg-secondary border-border/50'}`}
                                >
                                    <Text className={`font-bold text-xs ${budgetMonth.label === bm.label ? 'text-primary' : 'text-text-secondary'}`}>{bm.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Floating Save Button */}
            <View style={{ position: 'absolute', bottom: 100, left: 20, right: 20, zIndex: 100 }}>
                <TouchableOpacity 
                    style={{ width: '100%', backgroundColor: '#7C3AED', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Save Transaction</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent={true} animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                    <View style={{ backgroundColor: '#0F172A', width: '100%', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: '#334155', alignItems: 'center' }}>
                        <Text style={{ fontSize: 56, marginBottom: 12 }}>{successMsg.emoji}</Text>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#F8FAFC', marginBottom: 6 }}>Transaction Saved!</Text>
                        <Text style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24, textAlign: 'center' }}>{successMsg.text}</Text>
                        
                        <TouchableOpacity 
                            style={{ width: '100%', backgroundColor: '#7C3AED', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
                            onPress={handleAddAnother}
                        >
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>➕ Add Another Transaction</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={{ width: '100%', backgroundColor: '#1E293B', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' }}
                            onPress={handleGoHome}
                        >
                            <Text style={{ color: '#F8FAFC', fontWeight: '700', fontSize: 15 }}>🏠 Go to Dashboard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
        </SafeAreaView>
    );
}
