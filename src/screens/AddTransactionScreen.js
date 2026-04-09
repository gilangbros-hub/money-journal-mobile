import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/axios';

const types = [
    { name: 'Eat', icon: '🍽️', accent: '#FF8A3D' },
    { name: 'Snack', icon: '🍿', accent: '#FF4D6D' },
    { name: 'Groceries', icon: '🛒', accent: '#22C55E' },
    { name: 'Laundry', icon: '🧺', accent: '#06B6D4' },
    { name: 'Bensin', icon: '⛽', accent: '#F59E0B' },
    { name: 'Flazz', icon: '💳', accent: '#7C3AED' },
    { name: 'Home Appliance', icon: '🏠', accent: '#8B5CF6' },
    { name: 'Jumat Berkah', icon: '🤲', accent: '#10B981' },
    { name: 'Uang Sampah', icon: '🗑️', accent: '#64748B' },
    { name: 'Uang Keamanan', icon: '👮', accent: '#0EA5E9' },
    { name: 'Medicine', icon: '💊', accent: '#EF4444' },
    { name: 'Others', icon: '📦', accent: '#A855F7' },
];

const pockets = [
    { name: 'Kwintals', icon: '💰', accent: '#F59E0B' },
    { name: 'Groceries', icon: '🥦', accent: '#22C55E' },
    { name: 'Weekday Transport', icon: '🚌', accent: '#1677FF' },
    { name: 'Weekend Transport', icon: '🚗', accent: '#0EA5E9' },
    { name: 'Investasi', icon: '📈', accent: '#8B5CF6' },
    { name: 'Bandung', icon: '⛰️', accent: '#14B8A6' },
    { name: 'Sedeqah', icon: '🤲', accent: '#F97316' },
    { name: 'IPL', icon: '🏘️', accent: '#EC4899' },
];

const celebrationMessages = [
    { emoji: '🎉', text: 'Great job tracking!' },
    { emoji: '💪', text: 'Discipline = Freedom!' },
    { emoji: '🔥', text: "You're on fire!" },
    { emoji: '✨', text: 'Every Rupiah counts!' },
    { emoji: '🏆', text: 'Champion move!' },
    { emoji: '📊', text: 'Data is power!' },
    { emoji: '🚀', text: 'Finances on track!' },
    { emoji: '💎', text: 'Smart money move!' },
];

const getBudgetMonths = () => {
    const dates = [];
    const now = new Date();
    for (let i = -1; i <= 1; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        dates.push({
            label: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
            value: { month: d.getMonth() + 1, year: d.getFullYear() },
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        });
    }
    return dates;
};

const formatAmount = (digits) => {
    if (!digits) return '0';
    return Number(digits).toLocaleString('id-ID');
};

const formatDateTimeLabel = (value) => {
    const dateLabel = value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const timeLabel = value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateLabel} · ${timeLabel}`;
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

function BottomSheet({ visible, title, items, selectedValue, onClose, onSelect, bottomInset }) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
                <View style={{
                    backgroundColor: '#FFFFFF',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: Math.max(bottomInset, 16) + 12,
                }}>
                    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E5E5', alignSelf: 'center', marginBottom: 16 }} />
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 }}>{title}</Text>
                    <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                        {items.map((item) => {
                            const isSelected = selectedValue === item.name;
                            return (
                                <TouchableOpacity
                                    key={item.name}
                                    onPress={() => { onSelect(item.name); onClose(); }}
                                    activeOpacity={0.7}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 12,
                                        paddingHorizontal: 12,
                                        borderRadius: 14,
                                        marginBottom: 4,
                                        backgroundColor: isSelected ? '#FFF9E6' : 'transparent',
                                    }}
                                >
                                    <Text style={{ fontSize: 18, marginRight: 10 }}>{item.icon}</Text>
                                    <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#1A1A1A' }}>{item.name}</Text>
                                    {isSelected && <Text style={{ fontSize: 14, fontWeight: '700', color: '#F5A623' }}>✓</Text>}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function FieldRow({ label, value, icon, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
            }}
        >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#666666' }}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {icon && <Text style={{ fontSize: 14, marginRight: 6 }}>{icon}</Text>}
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginRight: 4 }}>{value}</Text>
                <Text style={{ fontSize: 14, color: '#CCCCCC' }}>›</Text>
            </View>
        </TouchableOpacity>
    );
}

export default function AddTransactionScreen({ navigation }) {
    const budgetMonthsList = useMemo(() => getBudgetMonths(), []);
    const insets = useSafeAreaInsets();
    const amountInputRef = useRef(null);

    const [amount, setAmount] = useState('');
    const [ngapain, setNgapain] = useState('');
    const [type, setType] = useState('Eat');
    const [pocket, setPocket] = useState('Kwintals');
    const [budgetMonth, setBudgetMonth] = useState(budgetMonthsList[1]);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [closedMonthKeys, setClosedMonthKeys] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState({ emoji: '🎉', text: '' });
    const [showTypeSheet, setShowTypeSheet] = useState(false);
    const [showPocketSheet, setShowPocketSheet] = useState(false);
    const [isEditingAmount, setIsEditingAmount] = useState(false);

    const selectedType = types.find((item) => item.name === type) || types[0];
    const selectedPocket = pockets.find((item) => item.name === pocket) || pockets[0];
    const formattedAmount = formatAmount(amount);

    useEffect(() => { fetchClosedMonths(); }, []);

    useEffect(() => {
        if (isEditingAmount && amountInputRef.current) amountInputRef.current.focus();
    }, [isEditingAmount]);

    const fetchClosedMonths = async () => {
        try {
            const response = await api.get('/api/budget/closed-months');
            if (response.data?.data) {
                const keys = response.data.data.map((c) => c.key);
                setClosedMonthKeys(keys);
                if (keys.includes(budgetMonth.key)) {
                    const firstOpen = budgetMonthsList.find((m) => !keys.includes(m.key));
                    if (firstOpen) setBudgetMonth(firstOpen);
                }
            }
        } catch (err) { /* keep usable */ }
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const handleAmountChange = (value) => setAmount(value.replace(/[^0-9]/g, ''));

    const resetForm = () => {
        setAmount('');
        setNgapain('');
        setType('Eat');
        setPocket('Kwintals');
        const firstOpen = budgetMonthsList.find((m) => !closedMonthKeys.includes(m.key));
        setBudgetMonth(firstOpen || budgetMonthsList[1]);
        setDate(new Date());
        setIsEditingAmount(false);
    };

    const handleSave = async () => {
        if (!amount || !ngapain.trim()) {
            Alert.alert('Error', 'Please fill in the Amount and Notes fields.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/transaction', {
                amount: parseInt(amount, 10),
                ngapain: ngapain.trim(),
                type,
                pocket,
                budgetMonth: budgetMonth.value.month,
                budgetYear: budgetMonth.value.year,
                date: date.toISOString(),
            });
            const msg = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
            setSuccessMsg(msg);
            setShowSuccessModal(true);
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to save.';
            Alert.alert('Error', errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAnother = () => { setShowSuccessModal(false); resetForm(); };
    const handleGoHome = () => { setShowSuccessModal(false); resetForm(); navigation.navigate('Dashboard'); };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* Header */}
                <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A' }}>Add Transaction</Text>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 12,
                        paddingBottom: 40 + insets.bottom,
                        alignItems: 'center',
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Single Form Card */}
                    <Card style={{ padding: 0, width: '100%', maxWidth: 420 }}>
                        {/* Amount Section */}
                        <TouchableOpacity
                            onPress={() => setIsEditingAmount(true)}
                            activeOpacity={0.9}
                            style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16 }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666', marginBottom: 6 }}>Amount</Text>
                            {isEditingAmount ? (
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#F5A623', marginBottom: 4 }}>Rp</Text>
                                    <TextInput
                                        ref={amountInputRef}
                                        style={{ fontSize: 36, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', width: '100%' }}
                                        placeholder="0"
                                        placeholderTextColor="#CCCCCC"
                                        keyboardType="numeric"
                                        value={amount}
                                        onChangeText={handleAmountChange}
                                        onBlur={() => setIsEditingAmount(false)}
                                        selectTextOnFocus
                                    />
                                </View>
                            ) : (
                                <>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#F5A623', marginBottom: 4 }}>Rp</Text>
                                    <Text style={{ fontSize: 36, fontWeight: '800', color: '#1A1A1A' }}>{formattedAmount}</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Description */}
                        <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666', marginBottom: 8 }}>Description</Text>
                            <TextInput
                                style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: '#1A1A1A',
                                    backgroundColor: '#F5F5F0',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                }}
                                placeholder="What did you spend on?"
                                placeholderTextColor="#AAAAAA"
                                value={ngapain}
                                onChangeText={setNgapain}
                            />
                        </View>

                        {/* Field Rows */}
                        <View style={{ paddingHorizontal: 16 }}>
                            <FieldRow
                                label="Category"
                                value={selectedType.name}
                                icon={selectedType.icon}
                                onPress={() => setShowTypeSheet(true)}
                            />
                            <FieldRow
                                label="Pocket"
                                value={selectedPocket.name}
                                icon={selectedPocket.icon}
                                onPress={() => setShowPocketSheet(true)}
                            />
                            <FieldRow
                                label="Date & Time"
                                value={formatDateTimeLabel(date)}
                                onPress={() => setShowDatePicker(true)}
                            />
                        </View>

                        {/* Budget Month */}
                        <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666', marginBottom: 10 }}>Budget Month</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {budgetMonthsList.map((month) => {
                                    const isClosed = closedMonthKeys.includes(month.key);
                                    const isSelected = budgetMonth.label === month.label;
                                    return (
                                        <TouchableOpacity
                                            key={month.label}
                                            onPress={() => !isClosed && setBudgetMonth(month)}
                                            disabled={isClosed}
                                            activeOpacity={0.7}
                                            style={{
                                                flex: 1,
                                                borderRadius: 12,
                                                paddingVertical: 10,
                                                alignItems: 'center',
                                                backgroundColor: isClosed ? '#F0F0F0' : isSelected ? '#FFF9E6' : '#F5F5F0',
                                                borderWidth: isSelected ? 1.5 : 0,
                                                borderColor: isSelected ? '#F5A623' : 'transparent',
                                                opacity: isClosed ? 0.5 : 1,
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 12,
                                                fontWeight: '700',
                                                color: isClosed ? '#999999' : isSelected ? '#D4891A' : '#333333',
                                            }}>
                                                {isClosed ? `🔒 ${month.label}` : month.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Save Button — inside card */}
                        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={loading}
                                activeOpacity={0.9}
                                style={{
                                    backgroundColor: '#F5A623',
                                    borderRadius: 28,
                                    height: 52,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#1A1A1A" />
                                ) : (
                                    <Text style={{ color: '#1A1A1A', fontWeight: '800', fontSize: 15 }}>Save Transaction</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Card>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Sheets */}
            <BottomSheet
                visible={showTypeSheet}
                title="Expense Type"
                items={types}
                selectedValue={type}
                onClose={() => setShowTypeSheet(false)}
                onSelect={setType}
                bottomInset={insets.bottom}
            />
            <BottomSheet
                visible={showPocketSheet}
                title="Pocket Source"
                items={pockets}
                selectedValue={pocket}
                onClose={() => setShowPocketSheet(false)}
                onSelect={setPocket}
                bottomInset={insets.bottom}
            />

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                    <View style={{ backgroundColor: '#FFFFFF', width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#FFF9E6', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                            <Text style={{ fontSize: 32 }}>{successMsg.emoji}</Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 }}>Transaction Saved</Text>
                        <Text style={{ fontSize: 13, color: '#666666', marginBottom: 20, textAlign: 'center' }}>{successMsg.text}</Text>

                        <TouchableOpacity
                            onPress={handleAddAnother}
                            activeOpacity={0.9}
                            style={{ width: '100%', backgroundColor: '#F5A623', borderRadius: 16, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}
                        >
                            <Text style={{ color: '#1A1A1A', fontWeight: '700', fontSize: 14 }}>Add Another</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleGoHome}
                            activeOpacity={0.9}
                            style={{ width: '100%', backgroundColor: '#F5F5F0', borderRadius: 16, height: 48, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text style={{ color: '#333333', fontWeight: '600', fontSize: 14 }}>Go to Dashboard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
